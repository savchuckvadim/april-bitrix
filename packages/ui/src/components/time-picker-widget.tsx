'use client';

import * as React from 'react';
import { Clock, Calendar, User, Plus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar as CalendarComponent } from '@workspace/ui/components/calendar';
import { TimePicker } from '@workspace/ui/components/time-picker';

export interface TimePickerWidgetProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSave?: (data: {
        title: string;
        description?: string;
        date: Date;
        time: string;
        contact: string;
        type: string;
        importance: 'important' | 'not_important';
    }) => void;
    existingEvents?: Array<{ time: string; title: string; type: string; contact?: string }>;
    selectedDate?: Date;
    className?: string;
}

const eventTypes = [
    { value: 'call', label: 'Звонок', icon: '📞' },
    { value: 'presentation', label: 'Презентация', icon: '📊' },
    { value: 'decision_call', label: 'Звонок по решению', icon: '✅' },
    { value: 'payment_call', label: 'Звонок по оплате', icon: '💳' },
    { value: 'post_sale_call', label: 'Звонок после продажи', icon: '🛒' }
];

const contacts = [
    'Иван Петров',
    'Мария Сидорова',
    'Алексей Козлов',
    'Елена Волкова',
    'Дмитрий Соколов'
];

const TimePickerWidget = React.forwardRef<HTMLButtonElement, TimePickerWidgetProps>(
    (
        {
            isOpen: controlledOpen,
            onOpenChange: controlledOnOpenChange,
            onSave,
            existingEvents = [],
            selectedDate = new Date(),
            className,
            ...props
        },
        ref
    ) => {
        const [internalOpen, setInternalOpen] = React.useState(false);
        const [showCalendar, setShowCalendar] = React.useState(false);

        const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
        const onOpenChange = controlledOnOpenChange || setInternalOpen;

        // Состояние формы
        const [formData, setFormData] = React.useState({
            title: '',
            description: '',
            date: selectedDate,
            time: '',
            contact: '',
            type: 'call',
            importance: 'important' as 'important' | 'not_important'
        });

        // Обновляем дату в форме при изменении selectedDate
        React.useEffect(() => {
            setFormData(prev => ({ ...prev, date: selectedDate }));
        }, [selectedDate]);

        const handleSave = () => {
            if (formData.title && formData.time && formData.contact) {
                onSave?.(formData);
                // Сброс формы
                setFormData({
                    title: '',
                    description: '',
                    date: new Date(),
                    time: '',
                    contact: '',
                    type: 'call',
                    importance: 'important'
                });
                onOpenChange(false);
            }
        };

        const handleCancel = () => {
            setFormData({
                title: '',
                description: '',
                date: new Date(),
                time: '',
                contact: '',
                type: 'call',
                importance: 'important'
            });
            onOpenChange(false);
        };

        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        ref={ref}
                        className={cn('gap-2', className)}
                        {...props}
                    >
                        <Clock className="w-4 h-4" />
                        Запланировать событие
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Планирование события
                        </DialogTitle>
                        <DialogDescription>
                            Создайте новое событие с указанием времени, контакта и деталей
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Название события *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Что нужно сделать"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Тип события
                                </label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    <span>{type.icon}</span>
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Дата и время */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Дата
                                </label>
                                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {formData.date.toLocaleDateString('ru-RU')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={formData.date}
                                            onSelect={(date) => {
                                                setFormData({ ...formData, date: date || new Date() });
                                                setShowCalendar(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Время *
                                </label>
                                <TimePicker
                                    value={formData.time}
                                    onChange={(time) => setFormData({ ...formData, time })}
                                    placeholder="Выберите время"
                                    allowManualInput={true}
                                    showTimeline={true}
                                    existingEvents={existingEvents}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Контакт и важность */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Контакт *
                                </label>
                                <Select
                                    value={formData.contact}
                                    onValueChange={(value) => setFormData({ ...formData, contact: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите контакт" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((contact) => (
                                            <SelectItem key={contact} value={contact}>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    {contact}
                                                </div>
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="new">
                                            <div className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                Создать новый контакт
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Важность
                                </label>
                                <Select
                                    value={formData.importance}
                                    onValueChange={(value: 'important' | 'not_important') =>
                                        setFormData({ ...formData, importance: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="important">Важное</SelectItem>
                                        <SelectItem value="not_important">Неважное</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Описание */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Описание
                            </label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Дополнительные детали события..."
                                className="min-h-20"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.title || !formData.time || !formData.contact}
                        >
                            Создать событие
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
);

TimePickerWidget.displayName = 'TimePickerWidget';

export { TimePickerWidget };
