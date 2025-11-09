'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { ChevronDown, ChevronUp, Download, FileSpreadsheet } from 'lucide-react';
import { getBlockState, setBlockState, BlockState } from '../../lib/localStorage-util';
import { cn } from '@workspace/ui/lib/utils';

interface ReportBlockWrapperProps {
    blockId: string;
    title: string;
    children: React.ReactNode;
    onDownload?: () => void;
    downloadLabel?: string;
    className?: string;
}

export const ReportBlockWrapper: React.FC<ReportBlockWrapperProps> = ({
    blockId,
    title,
    children,
    onDownload,
    downloadLabel = 'Скачать',
    className,
}) => {
    const [state, setState] = useState<BlockState>(() => getBlockState(blockId));

    useEffect(() => {
        setState(getBlockState(blockId));
    }, [blockId]);

    const handleToggleVisibility = () => {
        const newState = { ...state, isVisible: !state.isVisible };
        setState(newState);
        setBlockState(blockId, newState);
    };

    const handleToggleExcel = (checked: boolean) => {
        const newState = { ...state, isIncludedInExcel: checked };
        setState(newState);
        setBlockState(blockId, newState);
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        }
    };

    return (
        <Card className={cn('mb-4 shadow-none bg-background-muted', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleVisibility}
                            className="h-8 w-8 p-0"
                        >
                            {state.isVisible ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`excel-${blockId}`}
                                checked={state.isIncludedInExcel}
                                onCheckedChange={handleToggleExcel}
                            />
                            <Label
                                htmlFor={`excel-${blockId}`}
                                className="text-sm cursor-pointer flex items-center gap-1"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                В Excel
                            </Label>
                        </div>
                        {onDownload && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {downloadLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            {state.isVisible && (
                <CardContent className="pt-0">
                    {children}
                </CardContent>
            )}
        </Card>
    );
};

