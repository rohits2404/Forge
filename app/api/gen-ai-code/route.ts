import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Groq from "groq-sdk";

import { prisma } from "@/lib/prisma";
import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import type { Message, FileData } from "@/types/workspace";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function sseEvent(type: string, payload: unknown): string {
    return `data: ${JSON.stringify({
        type,
        ...(payload as object),
    })}\n\n`;
}

async function validateDependencies(
    deps: Record<string, string>,
): Promise<Record<string, string>> {
    const valid: Record<string, string> = {};

    await Promise.all(
        Object.entries(deps).map(async ([pkg, version]) => {
            try {
                const res = await fetch(
                    `https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`,
                    {
                        signal: AbortSignal.timeout(1500),
                    },
                );

                if (res.ok) {
                    valid[pkg] = version;
                }
            } catch {}
        }),
    );

    return valid;
}

function trimHistory(messages: Message[]): Message[] {
    if (messages.length <= 10) return messages;

    return [messages[0], ...messages.slice(-8)];
}

const SYSTEM_PROMPT = `You are an expert React developer. Your job is to generate complete, working React applications based on user prompts.

RULES:

1. Always respond with a valid JSON object — no markdown fences, no extra text.

2. The JSON must match this exact shape:

{
  "assistantMessage": "<brief explanation of what you built/changed>",
  "title": "<short 2-4 word title for the app, e.g. 'Todo List App'>",
  "files": {
    "/App.js": {
      "code": "<full file content>"
    },
    "/components/SomeComponent.js": {
      "code": "<full file content>"
    }
  },
  "dependencies": {
    "some-package": "latest"
  }
}

3. Use React (functional components + hooks). Do NOT use TypeScript in generated files.

4. Use Tailwind CSS for all styling. Do not use CSS modules or inline styles unless absolutely necessary.

5. The entry point must always be /App.js and must export a default component.

6. All imports must reference files you include in "files" or packages in "dependencies".

7. Do not include react, react-dom, or tailwindcss in "dependencies" — they are always available.

8. When modifying existing code, include ALL files (both changed and unchanged) in "files".

9. Keep code clean, readable, and production-quality.

10. If the user attaches an image, use it as a design reference and match the layout/style as closely as possible.

11. Return complete file contents, never partial snippets.

12. Ensure all generated imports, component references, and dependencies are consistent.

13. Never put explanations or markdown outside the JSON object.`;

function buildGroqMessages(messages: Message[], fileData: FileData | null) {
    const trimmed = trimHistory(messages);

    return [
        {
            role: "system" as const,
            content: SYSTEM_PROMPT,
        },

        ...trimmed.map((msg, idx) => {
            const role =
                msg.role === "assistant"
                    ? ("assistant" as const)
                    : ("user" as const);

            let content = msg.content;

            if (msg.role === "user" && msg.imageUrl) {
                content = `[The user has attached an image. Image URL: ${msg.imageUrl}. Use it as a design reference where possible.]\n\n${content}`;
            }

            const isLast = idx === trimmed.length - 1;

            if (msg.role === "user" && isLast && fileData) {
                content +=
                    "\n\nCurrent project files for context:\n" +
                    JSON.stringify(fileData, null, 2);
            }

            return {
                role,
                content,
            };
        }),
    ];
}

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return Response.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const { workspaceId, userId, messages, fileData } = body as {
            workspaceId: string | null;
            userId: string;
            messages: Message[];
            fileData: FileData | null;
        };

        if (!messages?.length) {
            return Response.json(
                { message: "No messages provided" },
                { status: 400 },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                clerkId,
            },
            select: {
                id: true,
                credits: true,
            },
        });

        if (!user) {
            return Response.json(
                { message: "User not found" },
                { status: 404 },
            );
        }

        if (user.credits < CREDIT_COST_PER_GENERATION) {
            return Response.json(
                { message: "Insufficient credits" },
                { status: 402 },
            );
        }

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const enqueue = (chunk: string) => {
                    controller.enqueue(encoder.encode(chunk));
                };

                try {
                    const groqMessages = buildGroqMessages(messages, fileData);

                    enqueue(
                        sseEvent("status", {
                            message: "Generating application...",
                        }),
                    );

                    const groqStream = await groq.chat.completions.create({
                        model: GROQ_MODEL,

                        messages: groqMessages,

                        temperature: 0.7,

                        max_completion_tokens: 32768,

                        reasoning_effort: "medium",

                        reasoning_format: "hidden",

                        response_format: {
                            type: "json_object",
                        },

                        stream: true,
                    });

                    let accumulated = "";

                    for await (const chunk of groqStream) {
                        const content = chunk.choices[0]?.delta?.content;

                        if (content) {
                            accumulated += content;
                        }
                    }

                    enqueue(
                        sseEvent("status", {
                            message: "Processing generated files...",
                        }),
                    );

                    let parsed: {
                        assistantMessage: string;
                        title?: string;
                        files: Record<string, { code: string }>;
                        dependencies?: Record<string, string>;
                    };

                    try {
                        parsed = JSON.parse(accumulated);
                    } catch {
                        enqueue(
                            sseEvent("error", {
                                message:
                                    "AI returned invalid JSON. Please try again.",
                            }),
                        );

                        return;
                    }

                    const {
                        assistantMessage,
                        title: aiTitle,
                        files,
                        dependencies,
                    } = parsed;

                    if (
                        !files ||
                        typeof files !== "object" ||
                        Array.isArray(files) ||
                        !files["/App.js"] ||
                        typeof files["/App.js"].code !== "string"
                    ) {
                        enqueue(
                            sseEvent("error", {
                                message:
                                    "AI response is missing a valid /App.js file. Please try again.",
                            }),
                        );

                        return;
                    }

                    enqueue(
                        sseEvent("status", {
                            message: "Validating packages...",
                        }),
                    );

                    const validatedDeps = await validateDependencies(
                        dependencies ?? {},
                    );

                    const newFileData: FileData = {
                        files,
                        dependencies: validatedDeps,
                        title: aiTitle,
                    };

                    enqueue(
                        sseEvent("status", {
                            message: "Saving project...",
                        }),
                    );

                    const lastUserMessage = messages[messages.length - 1];

                    const updatedMessages: Message[] = [
                        ...messages,
                        {
                            role: "assistant",
                            content: assistantMessage,
                        },
                    ];

                    const [workspace] = await prisma.$transaction([
                        workspaceId
                            ? prisma.workspace.update({
                                  where: {
                                      id: workspaceId,
                                      userId,
                                  },
                                  data: {
                                      messages: updatedMessages as never,
                                      fileData: newFileData as never,
                                  },
                              })
                            : prisma.workspace.create({
                                  data: {
                                      userId,

                                      title:
                                          aiTitle ??
                                          lastUserMessage.content.slice(0, 80),

                                      messages: updatedMessages as never,

                                      fileData: newFileData as never,
                                  },
                              }),

                        prisma.user.update({
                            where: {
                                id: userId,
                            },
                            data: {
                                credits: {
                                    decrement: CREDIT_COST_PER_GENERATION,
                                },
                            },
                        }),
                    ]);

                    const updatedUser = await prisma.user.findUnique({
                        where: {
                            id: userId,
                        },
                        select: {
                            credits: true,
                        },
                    });

                    enqueue(
                        sseEvent("done", {
                            workspaceId: workspace.id,

                            assistantMessage,

                            fileData: newFileData,

                            creditsRemaining:
                                updatedUser?.credits ??
                                user.credits - CREDIT_COST_PER_GENERATION,
                        }),
                    );
                } catch (err) {
                    console.error("[gen-ai-code] Groq stream error:", err);

                    try {
                        enqueue(
                            sseEvent("error", {
                                message:
                                    "Something went wrong. Please try again.",
                            }),
                        );
                    } catch {}
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (err) {
        console.error("[gen-ai-code] Request error:", err);

        return Response.json(
            {
                message: "Something went wrong. Please try again.",
            },
            { status: 500 },
        );
    }
}

export const runtime = "nodejs";
export const maxDuration = 300;
