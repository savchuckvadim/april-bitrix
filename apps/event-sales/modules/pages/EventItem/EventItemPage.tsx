'use client';
import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { TimePicker } from '@workspace/ui/components/time-picker';
import {
    Phone,
    Presentation,
    CheckCircle,
    CreditCard,
    ShoppingCart,
    Calendar as CalendarIcon,
    User,
    Clock,
    Volume2,
    Send,
    Plus,
    Edit,
    ChevronDown,
    X,
    ArrowLeft
} from 'lucide-react';

// Типы событий
type EventType = 'call' | 'presentation' | 'decision_call' | 'payment_call' | 'post_sale_call';
type CompanyStatus = 'in_work' | 'sale' | 'refusal';
type EventResult = 'successful' | 'unsuccessful';
type EventImportance = 'important' | 'not_important';

// Конфигурация типов событий
const eventTypeConfig = {
    call: {
        label: 'Звонок',
        icon: Phone,
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    presentation: {
        label: 'Презентация',
        icon: Presentation,
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    decision_call: {
        label: 'Звонок по решению',
        icon: CheckCircle,
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    },
    payment_call: {
        label: 'Звонок по оплате',
        icon: CreditCard,
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
    },
    post_sale_call: {
        label: 'Звонок после продажи',
        icon: ShoppingCart,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
    }
};

// Статусы компании
const companyStatuses = [
    { value: 'in_work', label: 'В работе' },
    { value: 'sale', label: 'Продажа' },
    { value: 'refusal', label: 'Отказ' }
];

// Причины нерезультативности
const failureReasons = [
    'Не заинтересован',
    'Нет бюджета',
    'Неподходящее время',
    'Уже работает с конкурентами',
    'Технические проблемы',
    'Другое'
];

// Контакты
const contacts = [
    'Иван Петров',
    'Мария Сидорова',
    'Алексей Козлов',
    'Елена Волкова',
    'Дмитрий Соколов'
];

// Моковые данные события
const mockEventData = {
    id: '1',
    type: 'call' as EventType,
    title: 'Обсуждение условий сотрудничества',
    contact: 'Иван Петров',
    date: new Date('2024-01-15'),
    time: '14:00',
    status: 'pending',
    priority: 'high' as 'high' | 'medium' | 'low',
    description: 'Первичный звонок для обсуждения возможностей интеграции'
};

// Компонент выбора контакта
const ContactSelector = ({ value, onChange, contacts, className = "" }: {
    value: string;
    onChange: (value: string) => void;
    contacts: string[];
    className?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactPhone, setNewContactPhone] = useState('');

    const handleCreateContact = () => {
        if (newContactName.trim()) {
            const newContact = `${newContactName}${newContactPhone ? ` (${newContactPhone})` : ''}`;
            onChange(newContact);
            setIsCreateDialogOpen(false);
            setNewContactName('');
            setNewContactPhone('');
        }
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`justify-start text-left font-normal ${className}`}
                    >
                        <User className="mr-2 h-4 w-4" />
                        {value || 'Выберите контакт'}
                        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-2">
                        <div className="space-y-1">
                            {contacts.map((contact) => (
                                <Button
                                    key={contact}
                                    variant={value === contact ? 'default' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => {
                                        onChange(contact);
                                        setIsOpen(false);
                                    }}
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    {contact}
                                </Button>
                            ))}
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-blue-600 hover:text-blue-700"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsCreateDialogOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Создать новый контакт
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Создать новый контакт</DialogTitle>
                        <DialogDescription>
                            Добавьте информацию о новом контакте
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Имя контакта
                            </label>
                            <Input
                                value={newContactName}
                                onChange={(e) => setNewContactName(e.target.value)}
                                placeholder="Введите имя"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                Телефон (необязательно)
                            </label>
                            <Input
                                value={newContactPhone}
                                onChange={(e) => setNewContactPhone(e.target.value)}
                                placeholder="+7 (999) 123-45-67"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleCreateContact}>
                            Создать
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const EventItemPage = () => {
    // Состояние текущего события
    const [currentEvent] = useState(mockEventData);

    // Состояние отчетности
    const [isResultSuccessful, setIsResultSuccessful] = useState<boolean | null>(null);
    const [selectedCompanyStatus, setSelectedCompanyStatus] = useState<CompanyStatus>('in_work');
    const [selectedFailureReason, setSelectedFailureReason] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [selectedContact, setSelectedContact] = useState<string>(currentEvent.contact);
    const [isPresentationConducted, setIsPresentationConducted] = useState<boolean>(false);

    // Состояние планирования
    const [plannedEvent, setPlannedEvent] = useState<Partial<{
        type: EventType;
        title: string;
        date: Date;
        time: string;
        contact: string;
        importance: EventImportance;
    }>>({
        type: 'presentation',
        title: '',
        date: new Date(),
        time: '',
        contact: '',
        importance: 'important'
    });

    // UI состояние
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const [isAudioDialogOpen, setIsAudioDialogOpen] = useState<boolean>(false);

    // Моковые данные запланированных событий на выбранный день
    const [existingEvents] = useState([
        { time: '09:00', title: 'Встреча с клиентом', type: 'call' },
        { time: '11:30', title: 'Презентация продукта', type: 'presentation' },
        { time: '14:00', title: 'Обсуждение условий', type: 'call' },
        { time: '16:30', title: 'Звонок по решению', type: 'decision_call' }
    ]);

    const config = eventTypeConfig[currentEvent.type];
    const IconComponent = config.icon;

    const handleSubmit = () => {
        console.log('Отправка отчета:', {
            currentEvent: {
                ...currentEvent,
                result: isResultSuccessful ? 'successful' : 'unsuccessful',
                companyStatus: isResultSuccessful ? selectedCompanyStatus : undefined,
                reason: !isResultSuccessful ? selectedFailureReason : undefined,
                isPresentationConducted,
                comment,
                contact: selectedContact
            },
            plannedEvent: plannedEvent
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="mb-6">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к списку
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Событие</h1>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Основная информация о событии */}
                    <div className="col-span-7">
                        <Card className="mb-6">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                        <IconComponent className={`w-5 h-5 ${config.textColor}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{currentEvent.title}</CardTitle>
                                        <div className="flex items-center gap-4 mt-1">
                                            <Badge variant={currentEvent.priority === 'high' ? 'destructive' : currentEvent.priority === 'medium' ? 'default' : 'secondary'}>
                                                {currentEvent.priority === 'high' ? 'Высокий' : currentEvent.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                                            </Badge>
                                            <Badge variant="outline">
                                                {config.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{currentEvent.contact}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span className="font-medium">{currentEvent.date.toLocaleDateString('ru-RU')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">{currentEvent.time}</span>
                                </div>
                                {currentEvent.description && (
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {currentEvent.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Отчетность */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">📊 Отчетность по событию</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Выбор результативности */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Было ли событие результативным?
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <RadioGroup
                                            value={isResultSuccessful?.toString()}
                                            onValueChange={(value) => setIsResultSuccessful(value === 'true')}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="true" id="successful" />
                                                <label htmlFor="successful" className="text-sm font-medium">
                                                    Результативно
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="false" id="unsuccessful" />
                                                <label htmlFor="unsuccessful" className="text-sm font-medium">
                                                    Нерезультативно
                                                </label>
                                            </div>
                                        </RadioGroup>

                                        {/* Кнопка презентации */}
                                        <Button
                                            variant={isPresentationConducted ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setIsPresentationConducted(!isPresentationConducted)}
                                            className={`${isPresentationConducted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                        >
                                            <Presentation className="w-4 h-4 mr-1" />
                                            Презентация
                                        </Button>
                                    </div>
                                </div>

                                {/* Условные поля */}
                                <div className="grid grid-cols-2 gap-3">
                                    {isResultSuccessful === true && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                Статус компании
                                            </label>
                                            <Select value={selectedCompanyStatus} onValueChange={(value: CompanyStatus) => setSelectedCompanyStatus(value)}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {companyStatuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {isResultSuccessful === false && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                Причина неудачи
                                            </label>
                                            <Select value={selectedFailureReason} onValueChange={setSelectedFailureReason}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Выберите причину" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {failureReasons.map((reason) => (
                                                        <SelectItem key={reason} value={reason}>
                                                            {reason}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Контакт
                                        </label>
                                        <ContactSelector
                                            value={selectedContact}
                                            onChange={setSelectedContact}
                                            contacts={contacts}
                                            className="h-9 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Комментарий и аудиозаписи */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Комментарий
                                        </label>
                                        <Textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Опишите детали проведенного события..."
                                            className="min-h-20"
                                        />
                                    </div>

                                    {/* Кнопка аудиозаписей */}
                                    <div className="flex justify-end">
                                        <Dialog open={isAudioDialogOpen} onOpenChange={setIsAudioDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Volume2 className="w-4 h-4" />
                                                    Аудиозаписи
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>🎵 Аудиозаписи разговоров</DialogTitle>
                                                    <DialogDescription>
                                                        Выберите и воспроизведите аудиозаписи для привязки к событию
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                                    <div className="text-center py-8 text-gray-500">
                                                        Нет доступных аудиозаписей
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={() => setIsAudioDialogOpen(false)}>
                                                        Закрыть
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Боковая панель планирования */}
                    <div className="col-span-5">
                        <div className="sticky top-6">
                            {/* Планирование следующего события */}
                            <Card className="mb-4">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        📅 Планирование следующего события
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                Тип события
                                            </label>
                                            <Select
                                                value={plannedEvent.type}
                                                onValueChange={(value: EventType) => setPlannedEvent({ ...plannedEvent, type: value })}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(eventTypeConfig).map(([key, config]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-2">
                                                                <config.icon className="w-4 h-4" />
                                                                {config.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                Время
                                            </label>
                                            <TimePicker
                                                value={plannedEvent.time || ''}
                                                onChange={(time) => setPlannedEvent({ ...plannedEvent, time })}
                                                className="h-8 w-full text-xs"
                                                allowManualInput={true}
                                                showTimeline={true}
                                                existingEvents={existingEvents}
                                                placeholder="Выберите время"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Дата
                                        </label>
                                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="h-8 w-full justify-start text-left font-normal text-xs"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {plannedEvent.date?.toLocaleDateString('ru-RU') || 'Выберите дату'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={plannedEvent.date}
                                                    onSelect={(date) => {
                                                        setPlannedEvent({ ...plannedEvent, date: date || new Date() });
                                                        setShowCalendar(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Название
                                        </label>
                                        <Input
                                            value={plannedEvent.title || ''}
                                            onChange={(e) => setPlannedEvent({ ...plannedEvent, title: e.target.value })}
                                            placeholder="Что нужно сделать"
                                            className="h-8 text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Контакт
                                        </label>
                                        <ContactSelector
                                            value={plannedEvent.contact || ''}
                                            onChange={(contact) => setPlannedEvent({ ...plannedEvent, contact })}
                                            contacts={contacts}
                                            className="h-8 w-full text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                                            Важность
                                        </label>
                                        <RadioGroup
                                            value={plannedEvent.importance}
                                            onValueChange={(value: EventImportance) => setPlannedEvent({ ...plannedEvent, importance: value })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="important" id="important" className="w-3 h-3" />
                                                <label htmlFor="important" className="text-xs font-medium">
                                                    Важное
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="not_important" id="not_important" className="w-3 h-3" />
                                                <label htmlFor="not_important" className="text-xs font-medium">
                                                    Неважное
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Кнопка отправки */}
                            <Card>
                                <CardContent className="p-3">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={handleSubmit}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Отправить отчет
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
