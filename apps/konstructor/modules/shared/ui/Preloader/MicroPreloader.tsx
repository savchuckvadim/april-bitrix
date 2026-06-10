'use client';

import { cn } from '@workspace/ui/lib/utils';
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
export const MicroPreloader = ({
    fullWidth = false,
}: {
    fullWidth?: boolean;
}) => {
    return (
        <div
            className={cn(
                'flex items-center justify-center h-4',
                fullWidth ? 'w-full' : 'w-30',
            )}
        >
            <ShimmerText width={fullWidth ? 'w-full' : 'w-30'} />
        </div>
    );
};

// Pulsing dots loader
export function DotsLoader({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center space-x-1', className)}>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
    );
}

// Skeleton text loader
export function SkeletonText({
    width = 'w-16',
    height = 'h-4',
    className,
}: {
    width?: string;
    height?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'bg-gray-200 rounded animate-pulse',
                width,
                height,
                className,
            )}
        ></div>
    );
}

// Tiny spinner
export function TinySpinner({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'inline-block w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin',
                className,
            )}
        ></div>
    );
}

// Typing animation
export function TypingLoader({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center space-x-0.5', className)}>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
    );
}

// Pulse bar
export function PulseBar({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'w-8 h-1 bg-gray-300 rounded-full overflow-hidden relative',
                className,
            )}
        >
            <div className="absolute inset-0 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
    );
}

// Wave loader
export function WaveLoader({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-end space-x-0.5', className)}>
            <div className="w-0.5 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.4s]"></div>
            <div className="w-0.5 h-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.2s]"></div>
            <div className="w-0.5 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
    );
}

// Shimmer effect
export function ShimmerText({
    width = 'w-20',
    className,
}: {
    width?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse bg-[length:200%_100%]',
                width,
                className,
            )}
            style={{
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        >
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
            `}</style>
        </div>
    );
}

// Demo component showing all loaders in context


export default function MicropreloaderDemo(): ReactElement  {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setLoading(prev => !prev);
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Micropreloaders</h1>
                <p className="text-gray-600">
                    Elegant loading indicators for small components
                </p>
            </div>

            <div className="grid gap-6">
                {/* Inline text examples */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Inline Text Loading
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span>Status:</span>
                            {loading ? (
                                <DotsLoader />
                            ) : (
                                <span className="text-green-600">
                                    Connected
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span>Loading</span>
                            {loading ? <TinySpinner /> : <span>Complete</span>}
                        </div>

                        <div className="flex items-center gap-2">
                            <span>Processing</span>
                            {loading ? <TypingLoader /> : <span>Done</span>}
                        </div>
                    </div>
                </div>

                {/* Card examples */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Card Content Loading
                    </h2>
                    <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="space-y-1">
                                {loading ? (
                                    <>
                                        <SkeletonText
                                            width="w-24"
                                            height="h-3"
                                        />
                                        <SkeletonText
                                            width="w-16"
                                            height="h-2"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="font-medium">
                                            John Doe
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            2 minutes ago
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {loading ? (
                                <>
                                    <SkeletonText width="w-full" height="h-3" />
                                    <SkeletonText width="w-3/4" height="h-3" />
                                    <SkeletonText width="w-1/2" height="h-3" />
                                </>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    This is some sample content that would
                                    appear after loading is complete. The
                                    skeleton loaders provide a nice preview of
                                    the content structure.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Button states */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Button Loading States
                    </h2>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-50">
                            {loading && (
                                <TinySpinner className="border-white border-t-blue-200" />
                            )}
                            {loading ? 'Saving...' : 'Save'}
                        </button>

                        <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2">
                            {loading && <DotsLoader />}
                            {loading ? 'Loading' : 'Load More'}
                        </button>
                    </div>
                </div>

                {/* Progress indicators */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Progress Indicators
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm">Upload progress:</span>
                            <PulseBar />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm">Audio processing:</span>
                            <WaveLoader />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm">Shimmer effect:</span>
                            <ShimmerText width="w-32" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-8">
                States toggle every 3 seconds to demonstrate the loaders
            </div>
        </div>
    );
}
