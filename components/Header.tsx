import { checkUser } from "@/lib/checkUser";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { PricingModal } from "./PricingModal";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "./ui/button";

export const Header = async () => {
    const user = await checkUser();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
            <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 select-none">
                    <Image
                        src="/logo.png"
                        alt="Forge"
                        width={100}
                        height={100}
                        className="h-9 w-auto rounded-md"
                    />
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-5">
                    <Show when="signed-in">
                        <Link
                            href="/projects"
                            className="text-[13px] font-medium text-white/50 transition-colors hover:text-white"
                        >
                            Projects
                        </Link>

                        {user && (
                            <PricingModal>
                                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 transition-colors hover:bg-white/10">
                                    <Zap className="h-3 w-3 fill-white/70" />
                                    {user.credits} Credits
                                </span>
                            </PricingModal>
                        )}

                        <UserButton />
                    </Show>

                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/5"
                            >
                                Sign In
                            </Button>
                        </SignInButton>

                        <SignInButton mode="modal">
                            <Button
                                size="sm"
                                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-500 hover:text-white active:scale-95"
                            >
                                Get Started
                                <ArrowRight className="h-3 w-3 opacity-80" />
                            </Button>
                        </SignInButton>
                    </Show>
                </div>
            </nav>
        </header>
    );
};
