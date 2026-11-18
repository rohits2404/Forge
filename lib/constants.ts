export const PLANS = {
    free: {
        label: "Free",
        credits: 10,
        price: 0,
    },
    starter: {
        label: "Starter",
        credits: 50,
        price: 9,
    },
    pro: {
        label: "Pro",
        credits: 150,
        price: 29,
    },
} as const;

export const CREDIT_COST_PER_GENERATION = 1;

export const MIN_CREDITS_TO_GENERATE = 1;

export const PRICING_PLANS = [
    {
        key: "free",
        label: "Free",
        description: "Start Building. No Credit Card Required.",
        price: 0,
        featured: false,
        planId: null,
        active: true,
        features: ["10 Generations / Month", "Live Preview", "Export To Zip"],
    },
    {
        key: "starter",
        label: "Starter",
        description: "For Developers Who Build Regularly.",
        price: 9,
        featured: true,
        planId: process.env.NEXT_PUBLIC_STARTER_PLAN_ID!,
        active: false,
        features: [
            "50 Generations / Month",
            "Image Uploads",
            "Live Preview",
            "Export To Zip",
        ],
    },
    {
        key: "pro",
        label: "Pro",
        description: "For Power Users Who Ship Fast.",
        price: 29,
        featured: false,
        planId: process.env.NEXT_PUBLIC_PRO_PLAN_ID!,
        active: false,
        features: [
            "150 Generations / Month",
            "Priority AI (Faster Response)",
            "Live Preview",
            "Export To Zip",
            "Image Uploads",
            "Access To Forge Pro Agent",
        ],
    },
] as const;
