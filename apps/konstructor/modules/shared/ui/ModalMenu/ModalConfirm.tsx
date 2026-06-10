'use client';
import React from 'react';
import { Button } from '@workspace/ui/components/button';

interface ModalConfirmProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    warning?: string;
    type: 'delete' | 'error' | 'warning' | 'info';
    message: string;
    isLoading?: boolean;
    children?: React.ReactNode;
}

export function ModalConfirm({
    isOpen,
    onConfirm,
    onCancel,
    title,
    warning,
    type,
    message,
    isLoading = false,
    children,
}: ModalConfirmProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white opacity-100  rounded-lg p-6 max-w-md w-full mx-4 z-100 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        {warning && (
                            <p className="text-sm text-gray-500">{warning}</p>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700">{message}</p>
                </div>

                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="animate-spin w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Удаление...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                <span>Удалить</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
