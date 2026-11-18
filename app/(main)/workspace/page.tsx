import { getWorkspaceById, getWorkspaceUser } from "@/actions/workspace";
import { WorkspaceClient } from "@/components/WorkspaceClient";
import React from "react";

interface WorkspacePageProps {
    searchParams: Promise<{ prompt?: string; id?: string }>;
}

const WorkspacePage = async ({ searchParams }: WorkspacePageProps) => {
    const { prompt, id } = await searchParams;

    const user = await getWorkspaceUser();

    let workspace = null;
    if (id) {
        workspace = await getWorkspaceById(id, user.id);
    }

    return (
        <WorkspaceClient
            initialPrompt={prompt ?? null}
            workspace={workspace}
            userCredits={user.credits}
            userId={user.id}
            userPlan={user.plan}
        />
    );
};

export default WorkspacePage;
