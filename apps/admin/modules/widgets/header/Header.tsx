'use client';
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { LogOut } from "lucide-react";
import { Navigation } from "./navigation/Navigation";
import { ThemeTogglePanel } from "@/modules/shared";
import { useAuth } from "@/modules/features/auth";


export const Header = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    return (
        <header className="
         h-16
        flex flex-row justify-between items-center ">

            <Navigation />

            <div className="flex flex-row justify-end items-center gap-2">
                {user && (
                    <p className="text-sm text-muted-foreground">
                        {user.login}
                    </p>
                )}
                <ThemeTogglePanel />
                <Button
                    variant="outline"
                    className="h-8 m-1 "
                    onClick={() => {
                        logout();
                        router.replace('/auth/login');
                    }}
                >
                    <p className="text-sm">
                        Выйти
                    </p>
                    <LogOut className="size-3" />
                </Button>
            </div>
        </header>
    );
}
