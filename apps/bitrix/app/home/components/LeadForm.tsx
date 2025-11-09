'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Send, CheckCircle2 } from 'lucide-react';

export const LeadForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        managersCount: '',
        comment: '',
        privacy: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Получаем UTM параметры из URL
    const getUtmParams = () => {
        if (typeof window === 'undefined') return {};
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_term: params.get('utm_term') || '',
            utm_content: params.get('utm_content') || '',
        };
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Телефон обязателен';
        }
        if (!formData.privacy) {
            newErrors.privacy = 'Необходимо согласие на обработку данных';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Здесь будет отправка данных в Bitrix через API
            // Пока используем заглушку
            const payload = {
                ...formData,
                ...getUtmParams(),
                source: 'landing_page',
                timestamp: new Date().toISOString(),
            };

            // Трекинг события конверсии
            if (typeof window !== 'undefined') {
                if ((window as any).gtag) {
                    (window as any).gtag('event', 'form_submit', {
                        event_category: 'lead',
                        event_label: 'Contact Form',
                    });
                }
                if ((window as any).ym) {
                    (window as any).ym(12345678, 'reachGoal', 'form_submit'); // Заменить на реальный ID счетчика
                }
            }

            // Отправка в Bitrix (заглушка - нужно реализовать API endpoint)
            const response = await fetch('/api/bitrix/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    managersCount: '',
                    comment: '',
                    privacy: false,
                });
            } else {
                throw new Error('Ошибка отправки формы');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    if (isSubmitted) {
        return (
            <section id="contact" className="py-20 lg:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-2xl mx-auto border-2 border-primary/20">
                        <CardContent className="p-12 text-center">
                            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-foreground mb-4">
                                Спасибо за заявку!
                            </h3>
                            <p className="text-lg text-muted-foreground mb-6">
                                Мы свяжемся с вами в течение рабочего дня.
                            </p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Также вы можете скачать коммерческое предложение или зарегистрироваться в личном кабинете.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const element = document.querySelector('#commercial-proposal');
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    Скачать КП
                                </Button>
                                <Button
                                    onClick={() => {
                                        // Здесь будет ссылка на регистрацию
                                        window.location.href = '/auth/login';
                                    }}
                                >
                                    Войти в ЛК
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="max-w-2xl mx-auto border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold mb-4">
                            Оставьте заявку
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Мы настраиваем CRM под ваш бизнес
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Имя <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ваше имя"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Компания</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleChange('company', e.target.value)}
                                        placeholder="Название компании"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="your@email.com"
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Телефон <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+7 (999) 123-45-67"
                                        className={errors.phone ? 'border-destructive' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="managersCount">Количество менеджеров</Label>
                                <Input
                                    id="managersCount"
                                    type="number"
                                    value={formData.managersCount}
                                    onChange={(e) => handleChange('managersCount', e.target.value)}
                                    placeholder="10"
                                    min="1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">Комментарий</Label>
                                <Textarea
                                    id="comment"
                                    value={formData.comment}
                                    onChange={(e) => handleChange('comment', e.target.value)}
                                    placeholder="Расскажите о ваших задачах и требованиях"
                                    rows={4}
                                />
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="privacy"
                                    checked={formData.privacy}
                                    onCheckedChange={(checked) =>
                                        handleChange('privacy', checked as boolean)
                                    }
                                    className={errors.privacy ? 'border-destructive' : ''}
                                />
                                <Label
                                    htmlFor="privacy"
                                    className="text-sm leading-relaxed cursor-pointer"
                                >
                                    Я согласен на обработку персональных данных{' '}
                                    <span className="text-destructive">*</span>
                                    <a
                                        href="/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline ml-1"
                                    >
                                        (Политика конфиденциальности)
                                    </a>
                                </Label>
                            </div>
                            {errors.privacy && (
                                <p className="text-sm text-destructive">{errors.privacy}</p>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Отправка...'
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Отправить заявку
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

