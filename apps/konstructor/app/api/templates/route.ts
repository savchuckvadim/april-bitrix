import { NextResponse } from 'next/server';
import { STYLE_PRESETS } from '@/modules/app/lib/server/offer-style/styles';

export async function GET() {
    // Здесь можно получить шаблоны из базы данных
    // Пока что возвращаем предустановленные стили
    return NextResponse.json(STYLE_PRESETS);
}
