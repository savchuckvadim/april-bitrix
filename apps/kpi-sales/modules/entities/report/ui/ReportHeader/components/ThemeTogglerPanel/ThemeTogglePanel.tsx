"use client";
import { ChevronRight } from "lucide-react";
import { ThemeToggler } from "@workspace/theme";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeTogglePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Закрыть при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-row items-center">
      {/* Язычок */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className=" px-0 py-1 rounded-full cursor-pointer text-muted-foreground hover:bg-accent transition"
      >
        <ChevronRight
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Панелька с анимацией */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className=" flex flex-row items-center h-2 top-0 mx-2 bg-background "
          >
            <ThemeToggler />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
