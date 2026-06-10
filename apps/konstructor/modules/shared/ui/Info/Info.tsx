'use client';
import {
    Card,
    CardContent,
    CardTitle,
    CardHeader,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    AlertTriangle,
    CheckCircle,
    Info as InfoIcon,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

export interface IInfoProps {
    title: string;
    description?: string;
    items?: string[];
    children?: React.ReactNode;
    type: 'error' | 'warning' | 'info' | 'success';
    collapsible?: boolean;
    onClose?: () => void;
    className?: string;
}

const getTypeStyles = (type: IInfoProps['type']) => {
    switch (type) {
        case 'error':
            return {
                border: 'border-destructive',
                background: 'bg-destructive/10',
                text: 'text-destructive',
                icon: <AlertTriangle className="h-4 w-4" />,
            };
        case 'warning':
            return {
                border: 'border-orange-500',
                background: 'bg-orange-500/10',
                text: 'text-orange-600',
                icon: <AlertTriangle className="h-4 w-4" />,
            };
        case 'info':
            return {
                border: 'border-blue-500',
                background: 'bg-blue-500/10',
                text: 'text-blue-600',
                icon: <InfoIcon className="h-4 w-4" />,
            };
        case 'success':
            return {
                border: 'border-green-500',
                background: 'bg-green-500/10',
                text: 'text-green-600',
                icon: <CheckCircle className="h-4 w-4" />,
            };
        default:
            return {
                border: 'border-gray-500',
                background: 'bg-gray-500/10',
                text: 'text-gray-600',
                icon: <InfoIcon className="h-4 w-4" />,
            };
    }
};

export const Info = ({
    title,
    description,
    items = [],
    children,
    type,
    collapsible = false,
    onClose,
    className,
}: IInfoProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const styles = getTypeStyles(type);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Card className={cn(styles.border, styles.background, className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={styles.text}>{styles.icon}</div>
                        <CardTitle className={cn('text-sm', styles.text)}>
                            {title}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {collapsible && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleToggle}
                                className={cn('h-6 w-6 p-0', styles.text)}
                            >
                                {isCollapsed ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronUp className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {description && !isCollapsed && (
                    <p className={cn('text-sm', styles.text)}>{description}</p>
                )}
            </CardHeader>
            {!isCollapsed && items.length > 0 && (
                <CardContent className="space-y-2">
                    {items.map((item, index) => (
                        <p key={index} className={cn('text-sm', styles.text)}>
                            {item}
                        </p>
                    ))}
                </CardContent>
            )}
            {!isCollapsed && children && (
                <CardContent className="space-y-2">{children}</CardContent>
            )}
        </Card>
    );
};
