import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Header } from "@/components/Header";

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "500"],
    style: ["normal", "italic"],
    variable: "--font-serif",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Forge - AI App Builder",
    description:
        "Forge Is An AI-Powered App Builder That Transforms Your Ideas Into Fully Functional Applications. Build, Customize, And Launch Apps Faster With Intelligent AI Assistance—No Complex Coding Required.",
    icons: {
        icon: "/logo-short.jpeg",
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${lora.variable} ${dmSans.variable} font-sans`}>
                <ClerkProvider
                    appearance={{
                        theme: dark,
                    }}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Header />

                        <main>{children}</main>

                        <Toaster richColors />
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
