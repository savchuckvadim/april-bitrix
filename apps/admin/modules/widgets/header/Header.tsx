'use client';
import { Button } from "@workspace/ui/components/button";
import { LogOut } from "lucide-react";
import { Navigation } from "./navigation/Navigation";
import { ThemeTogglePanel } from "@/modules/shared";


export const Header = () => {

    return (
        <header className="
         h-16
        flex flex-row justify-between items-center ">

            <Navigation />

            <div className="flex flex-row justify-end items-center gap-2">
                <ThemeTogglePanel />
                <Button variant="outline" className="h-8 m-1 ">
                    <p className="text-sm">
                        Выйти
                    </p>
                    <LogOut className="size-3" />
                </Button>
            </div>
        </header>
    );
}
