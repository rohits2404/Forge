import { getUserProjects } from "@/actions/projects";
import { ImportProjectButton } from "@/components/ImportProjectButton";
import { ProjectCard } from "@/components/ProjectCard";
import { BlueTitle } from "@/components/reusables";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { auth } from "@clerk/nextjs/server";
import { Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const ProjectsPage = async () => {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const projects = await getUserProjects();

    return (
        <main className="min-h-screen bg-[#0a0a0a] px-4 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <BlueTitle className="text-6xl">Projects</BlueTitle>
                        <p className="mt-3 text-sm text-white/30">
                            All Your AI-Generated Apps In One Place.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ImportProjectButton />
                        <Link href="/">
                            <Button className={"cursor-pointer"}>
                                <Zap className="h-3 w-3 fill-black" />
                                New Project
                            </Button>
                        </Link>
                    </div>
                </div>
                {projects.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ProjectCard projects={projects} />
                )}
            </div>
        </main>
    );
};

export default ProjectsPage;
