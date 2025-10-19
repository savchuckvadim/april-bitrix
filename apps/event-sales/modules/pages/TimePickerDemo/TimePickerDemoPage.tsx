'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { TimePickerWidget } from '@workspace/ui/components/time-picker-widget';
import { TimeScale } from '@workspace/ui/components/time-scale';
import { TimePicker } from '@workspace/ui/components/time-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';

// Моковые данные событий по датам
const mockEventsByDate: Record<string, Array<{ time: string; title: string; type: string; contact: string }>> = {
    '2025-10-10': [
        { time: '09:00', title: 'Встреча с клиентом', type: 'call', contact: 'Иван Петров' },
        { time: '11:30', title: 'Презентация продукта', type: 'presentation', contact: 'Мария Сидорова' },
        { time: '14:00', title: 'Обсуждение условий', type: 'call', contact: 'Алексей Козлов' },
        { time: '16:30', title: 'Звонок по решению', type: 'decision_call', contact: 'Елена Волкова' },
        { time: '18:00', title: 'Звонок по оплате', type: 'payment_call', contact: 'Дмитрий Соколов' }
    ],
    '2025-01-16': [
        { time: '10:00', title: 'Планирование проекта', type: 'call', contact: 'Петр Иванов' },
        { time: '13:00', title: 'Демонстрация системы', type: 'presentation', contact: 'Анна Смирнова' },
        { time: '15:30', title: 'Переговоры по контракту', type: 'call', contact: 'Михаил Козлов' }
    ],
    '2025-01-17': [
        { time: '08:30', title: 'Утренний звонок', type: 'call', contact: 'Ольга Петрова' },
        { time: '12:00', title: 'Презентация для руководства', type: 'presentation', contact: 'Сергей Волков' },
        { time: '14:30', title: 'Обсуждение бюджета', type: 'call', contact: 'Екатерина Соколова' },
        { time: '17:00', title: 'Заключительная встреча', type: 'decision_call', contact: 'Дмитрий Морозов' }
    ]
};

export default function TimePickerDemoPage() {
    const [selectedTime, setSelectedTime] = useState('');
    const [scaleTime, setScaleTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [createdEvents, setCreatedEvents] = useState<any[]>([]);

    // Получаем события на выбранную дату
    const getEventsForDate = (date: Date) => {
        const dateKey = date.toISOString().split('T')[0];
        return mockEventsByDate[dateKey as keyof typeof mockEventsByDate] || [];
    };

    const currentEvents = getEventsForDate(selectedDate);

    const handleSaveEvent = (eventData: any) => {
        setCreatedEvents(prev => [...prev, eventData]);
        console.log('Создано событие:', eventData);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Демо TimePicker компонентов
                </h1>
                <p className="text-muted-foreground mb-6">
                    Тестирование виджета планирования и временной шкалы
                </p>

                {/* Селектор даты */}
                <div className="flex justify-center mb-8">
                    <Card className="w-fit">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium">Выберите дату:</div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            {selectedDate.toLocaleDateString('ru-RU')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setSelectedTime(''); // Сбрасываем выбранное время при смене даты
                                                    setScaleTime('');
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <div className="text-sm text-muted-foreground">
                                    Событий: {currentEvents.length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TimePicker Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle>Виджет планирования событий</CardTitle>
                        <CardDescription>
                            Полнофункциональный диалог для создания событий с TimePicker
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <TimePickerWidget
                            onSave={handleSaveEvent}
                            existingEvents={currentEvents}
                            selectedDate={selectedDate}
                        />

                        <div className="text-sm text-muted-foreground">
                            <p>Функции:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Выбор типа события</li>
                                <li>Календарь для даты</li>
                                <li>TimePicker с временной шкалой</li>
                                <li>Выбор контакта</li>
                                <li>Уровень важности</li>
                                <li>Описание события</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* TimeScale */}
                <Card>
                    <CardHeader>
                        <CardTitle>Временная шкала</CardTitle>
                        <CardDescription>
                            Интерактивная шкала для выбора времени с отображением событий
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <TimeScale
                            value={scaleTime}
                            onChange={setScaleTime}
                            existingEvents={currentEvents}
                            selectedDate={selectedDate}
                            height={90}
                            showHours={true}
                            step={15}
                        />

                        <div className="text-sm text-muted-foreground">
                            <p>Функции:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Клик для выбора времени</li>
                                <li>Перетаскивание мыши</li>
                                <li>Красные метки - запланированные события</li>
                                <li>Синяя метка - выбранное время</li>
                                <li>Подсказки при наведении</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* TimePicker Subwidget */}
                <Card>
                    <CardHeader>
                        <CardTitle>TimePicker Subwidget</CardTitle>
                        <CardDescription>
                            Активная часть TimePicker как отдельный подвиджет
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Выберите время:</label>
                            <div className="p-4 border rounded-lg bg-muted/20">
                                {/* Ручной ввод */}
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-foreground mb-2">Ручной ввод</div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            placeholder="HH:MM"
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                // Валидация времени
                                                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                                                if (timeRegex.test(selectedTime)) {
                                                    console.log('Время выбрано:', selectedTime);
                                                }
                                            }}
                                            className="h-8 px-3"
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>

                                {/* Временная шкала событий */}
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-foreground mb-2">
                                        Запланированные события на {selectedDate.toLocaleDateString('ru-RU')}
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {currentEvents.length === 0 ? (
                                            <div className="text-center text-gray-500 text-xs py-4">
                                                На эту дату событий не запланировано
                                            </div>
                                        ) : (
                                            currentEvents.map((event: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                                                >
                                                    <span className="font-medium">{event.time}</span>
                                                    <span className="text-gray-600 truncate ml-2">{event.title}</span>
                                                    <span className="text-gray-500 text-xs">{event.contact}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Популярные времена */}
                                <div className="mb-4">
                                    <div className="text-sm font-medium text-foreground mb-2">Популярное время</div>
                                    <div className="grid grid-cols-5 gap-1">
                                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? 'default' : 'ghost'}
                                                size="sm"
                                                className="h-8 text-xs"
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Кастомный выбор времени */}
                                <div className="border-t pt-4">
                                    <div className="text-sm font-medium text-foreground mb-3">Выберите время</div>
                                    <div className="flex items-center space-x-6">
                                        {/* Часы */}
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground">Часы</div>
                                            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={selectedTime.startsWith(i.toString().padStart(2, '0')) ? 'default' : 'ghost'}
                                                        size="sm"
                                                        className="h-8 w-16 text-xs"
                                                        onClick={() => {
                                                            const currentMinutes = selectedTime ? selectedTime.split(':')[1] || '00' : '00';
                                                            setSelectedTime(`${i.toString().padStart(2, '0')}:${currentMinutes}`);
                                                        }}
                                                    >
                                                        {i.toString().padStart(2, '0')}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Минуты */}
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground">Минуты</div>
                                            <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                                                {Array.from({ length: 60 }, (_, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={selectedTime.endsWith(i.toString().padStart(2, '0')) ? 'default' : 'ghost'}
                                                        size="sm"
                                                        className="h-8 w-12 text-xs"
                                                        onClick={() => {
                                                            const currentHours = selectedTime ? selectedTime.split(':')[0] || '00' : '00';
                                                            setSelectedTime(`${currentHours}:${i.toString().padStart(2, '0')}`);
                                                        }}
                                                    >
                                                        {i.toString().padStart(2, '0')}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Функции:</p>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Ручной ввод времени</li>
                                <li>Популярные времена</li>
                                <li>Сетка выбора часов/минут</li>
                                <li>Временная шкала событий</li>
                                <li>Валидация формата</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Созданные события */}
                <Card>
                    <CardHeader>
                        <CardTitle>Созданные события</CardTitle>
                        <CardDescription>
                            Список событий, созданных через виджет
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {createdEvents.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                Создайте первое событие через виджет выше
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {createdEvents.map((event, index) => (
                                    <div
                                        key={index}
                                        className="p-3 border rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{event.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.date.toLocaleDateString('ru-RU')} в {event.time}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {event.contact} • {event.type} • {event.importance === 'important' ? 'Важное' : 'Неважное'}
                                                </p>
                                            </div>
                                        </div>
                                        {event.description && (
                                            <p className="text-sm mt-2 text-muted-foreground">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Информация о выбранном времени */}
            {(selectedTime || scaleTime) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Выбранное время</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {selectedTime && (
                                <div>
                                    <p className="text-sm font-medium">TimePicker:</p>
                                    <p className="text-lg">{selectedTime}</p>
                                </div>
                            )}
                            {scaleTime && (
                                <div>
                                    <p className="text-sm font-medium">TimeScale:</p>
                                    <p className="text-lg">{scaleTime}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
