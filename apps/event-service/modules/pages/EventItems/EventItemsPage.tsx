import { useState } from 'react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
    Phone,
    Presentation,
    CheckCircle,
    CreditCard,
    ShoppingCart,
    Calendar,
    User,
    Clock,
    Play,
    Pause,
    RotateCcw,
    Check,
    X
} from 'lucide-react';

// Типы событий
type EventType = 'call' | 'presentation' | 'decision_call' | 'payment_call' | 'post_sale_call';

// Статусы событий
type EventStatus = 'pending' | 'in_progress' | 'completed' | 'postponed';

// Интерфейс события
interface EventItem {
    id: string;
    type: EventType;
    title: string;
    contact: string;
    deadline: Date;
    status: EventStatus;
    priority: 'high' | 'medium' | 'low';
    description?: string;
}

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

// Моковые данные
const mockEvents: EventItem[] = [
    {
        id: '1',
        type: 'call',
        title: 'Обсуждение условий сотрудничества',
        contact: 'Иван Петров',
        deadline: new Date('2024-01-15T14:00:00'),
        status: 'pending',
        priority: 'high',
        description: 'Первичный звонок для обсуждения возможностей интеграции'
    },
    {
        id: '2',
        type: 'presentation',
        title: 'Демонстрация продукта',
        contact: 'Мария Сидорова',
        deadline: new Date('2024-01-16T10:00:00'),
        status: 'pending',
        priority: 'high',
        description: 'Презентация основных возможностей системы'
    },
    {
        id: '3',
        type: 'decision_call',
        title: 'Обсуждение финального решения',
        contact: 'Алексей Козлов',
        deadline: new Date('2024-01-17T16:00:00'),
        status: 'in_progress',
        priority: 'medium',
        description: 'Звонок для принятия решения о покупке'
    },
    {
        id: '4',
        type: 'payment_call',
        title: 'Обсуждение условий оплаты',
        contact: 'Елена Волкова',
        deadline: new Date('2024-01-18T11:00:00'),
        status: 'pending',
        priority: 'medium',
        description: 'Уточнение деталей по оплате и срокам'
    },
    {
        id: '5',
        type: 'post_sale_call',
        title: 'Поддержка после внедрения',
        contact: 'Дмитрий Соколов',
        deadline: new Date('2024-01-19T15:00:00'),
        status: 'completed',
        priority: 'low',
        description: 'Проверка работы системы и решение вопросов'
    }
];

// Компонент карточки события
const EventCard = ({ event, onStartReporting, onPostpone }: {
    event: EventItem;
    onStartReporting: (eventId: string, isSuccessful: boolean) => void;
    onPostpone: (eventId: string) => void;
}) => {
    const config = eventTypeConfig[event.type];
    const IconComponent = config.icon;

    const isOverdue = event.deadline < new Date() && event.status !== 'completed';
    const isUrgent = event.priority === 'high' && event.status !== 'completed';

    const formatDeadline = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return `Просрочено на ${Math.abs(days)} дн.`;
        if (days === 0) return 'Сегодня';
        if (days === 1) return 'Завтра';
        return `Через ${days} дн.`;
    };

    return (
        <Card className={`${config.borderColor} ${isOverdue ? 'border-red-300 bg-red-50' : ''} ${isUrgent ? 'ring-2 ring-orange-200' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <IconComponent className={`w-5 h-5 ${config.textColor}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-1">
                                <Badge variant={event.priority === 'high' ? 'destructive' : event.priority === 'medium' ? 'default' : 'secondary'}>
                                    {event.priority === 'high' ? 'Высокий' : event.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                                </Badge>
                                <Badge variant={event.status === 'completed' ? 'default' : event.status === 'in_progress' ? 'secondary' : 'outline'}>
                                    {event.status === 'completed' ? 'Завершено' :
                                        event.status === 'in_progress' ? 'В работе' :
                                            event.status === 'postponed' ? 'Перенесено' : 'Ожидает'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Информация о событии */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{event.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{event.deadline.toLocaleDateString('ru-RU')}</span>
                    </div>
                </div>

                {/* Дедлайн */}
                <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-semibold' : isUrgent ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                    <Clock className="w-4 h-4" />
                    <span>{formatDeadline(event.deadline)}</span>
                </div>

                {/* Описание */}
                {event.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {event.description}
                    </p>
                )}

                {/* Кнопки действий */}
                {event.status !== 'completed' && (
                    <div className="flex gap-2 pt-2">
                        <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => onStartReporting(event.id, true)}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Результативный
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => onStartReporting(event.id, false)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Нерезультативный
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPostpone(event.id)}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Перенести
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export const EventItemsPage = () => {
    const [events, setEvents] = useState<EventItem[]>(mockEvents);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');

    const handleStartReporting = (eventId: string, isSuccessful: boolean) => {
        // Здесь будет логика перехода к странице отчетности
        console.log(`Начать отчетность для события ${eventId}, результат: ${isSuccessful ? 'успешный' : 'неуспешный'}`);

        // Обновляем статус события
        setEvents((prev: EventItem[]) => prev.map((event: EventItem) =>
            event.id === eventId
                ? { ...event, status: 'in_progress' as EventStatus }
                : event
        ));
    };

    const handlePostpone = (eventId: string) => {
        // Здесь будет логика переноса события
        console.log(`Перенести событие ${eventId}`);

        // Обновляем статус события
        setEvents((prev: EventItem[]) => prev.map((event: EventItem) =>
            event.id === eventId
                ? { ...event, status: 'postponed' as EventStatus }
                : event
        ));
    };

    const filteredEvents = events.filter((event: EventItem) => {
        if (filter === 'all') return true;
        if (filter === 'overdue') return event.deadline < new Date() && event.status !== 'completed';
        return event.status === filter;
    });

    const stats = {
        total: events.length,
        pending: events.filter((e: EventItem) => e.status === 'pending').length,
        inProgress: events.filter((e: EventItem) => e.status === 'in_progress').length,
        completed: events.filter((e: EventItem) => e.status === 'completed').length,
        overdue: events.filter((e: EventItem) => e.deadline < new Date() && e.status !== 'completed').length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок и статистика */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        События для отработки
                    </h1>

                    {/* Статистика */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-600">Всего событий</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600">Ожидают</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
                            <div className="text-sm text-gray-600">В работе</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-sm text-gray-600">Завершены</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <div className="text-sm text-gray-600">Просрочены</div>
                        </div>
                    </div>

                    {/* Фильтры */}
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'Все' },
                            { key: 'pending', label: 'Ожидают' },
                            { key: 'in_progress', label: 'В работе' },
                            { key: 'completed', label: 'Завершены' },
                            { key: 'overdue', label: 'Просрочены' }
                        ].map(({ key, label }) => (
                            <Button
                                key={key}
                                variant={filter === key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(key as any)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Список событий */}
                <div className="space-y-4">
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">Нет событий для отображения</div>
                        </div>
                    ) : (
                        filteredEvents.map((event: EventItem) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                onStartReporting={handleStartReporting}
                                onPostpone={handlePostpone}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventItemsPage;
