'use client';

import { AiMaterialsPanel } from '@/modules/entities/ai-materials';

/**
 * Страница кабинета «AI-материалы»: клиент управляет своими материалами
 * анализа звонков (документы по разделам базы знаний, типы звонков)
 * по доменам порталов своего аккаунта. Логика — в слайсе
 * modules/entities/ai-materials, страница — тонкая обёртка.
 */
export default function AiMaterialsPage() {
    return <AiMaterialsPanel />;
}
