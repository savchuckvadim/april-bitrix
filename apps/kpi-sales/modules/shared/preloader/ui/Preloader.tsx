import React from "react";

interface PreloaderProps {
  size?: "small" | "medium" | "large";
}
export default function Preloader({ size = "medium" }: PreloaderProps) {
  return (
    <div className="flex justify-center items-center h-6">
      <div
        className={`animate-spin rounded-full h-6 w-6 border-b-2 border-primary ${size === "small" ? "h-4 w-4" : size === "medium" ? "h-6 w-6" : "h-18 w-18"}`}
      ></div>
    </div>
  );
}
