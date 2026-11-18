import { Sparkles, Zap, Code2, Eye, Package, ImageIcon } from "lucide-react";

export const SUGGESTIONS = [
    "A Spotify Stats Dashboard With Charts",
    "A Kanban Board With Drag And Drop",
    "A Weather App With Animated Icons",
    "A Personal Finance Tracker",
    "A Recipe Finder With Filters",
    "A Pomodoro Timer With Tasks",
];

export const FEATURES = [
    {
        icon: Zap,
        label: "Instant Generation",
        desc: "Describe Your App In Plain English. Gemini 3.5 Flash Returns Production-Ready React + Tailwind Code In Seconds.",
    },
    {
        icon: Eye,
        label: "Live Preview",
        desc: "Your App Renders Instantly In The Browser Via Sandpack. No Install, No Build Step — Just A Working Preview.",
    },
    {
        icon: Code2,
        label: "Full Source Code",
        desc: "Browse Every Generated File. Edit Directly In The Built-In Editor And Watch The Preview Update In Real Time.",
    },
    {
        icon: Package,
        label: "Smart Packages",
        desc: "AI Picks The Right Npm Packages. We Validate Them Against The Npm Registry And Filter Hallucinated Ones Silently.",
    },
    {
        icon: Sparkles,
        label: "AI Error Recovery",
        desc: "When Your Preview Throws An Error, A Banner Appears. One Click Sends The Error To AI And Auto-Fixes The Code.",
    },
    {
        icon: ImageIcon,
        label: "Image-Aware Prompts",
        desc: "Attach Screenshots Or Mockups To Your Prompt. The AI Reads Them And Generates Code That Matches Your Design.",
    },
];

export const STEPS = [
    {
        number: "01",
        label: "Describe Your App",
        desc: "Type A Prompt Or Pick A Suggestion. Add Screenshots For Extra Context.",
    },
    {
        number: "02",
        label: "AI Generates Code",
        desc: "Gemini Writes React + Tailwind Components, Picks Dependencies, And Structures Your Files.",
    },
    {
        number: "03",
        label: "Preview & Refine",
        desc: "See Your App Live Instantly. Keep Chatting To Iterate — AI Remembers The Full Conversation.",
    },
    {
        number: "04",
        label: "Export And Deploy",
        desc: "Open In CodeSandbox, Copy The Source, And Deploy To A Live URL.",
    },
];

export const PLACEHOLDERS = [
    "A Task Manager With Priority Labels And Drag-And-Drop…",
    "A Crypto Portfolio Tracker With Live Charts…",
    "A Markdown Notes App With Live Preview…",
    "An Expense Tracker With Monthly Breakdowns…",
    "A Habit Tracker With Streaks And Heatmaps…",
];
