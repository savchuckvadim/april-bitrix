import { NextRequest, NextResponse } from 'next/server';



//редирект next из post запроса в апп
export async function POST(req: NextRequest) {
  try {

 

    
  
    const response = NextResponse.redirect(new URL('/report', req.url), 303);

 

    return response;
  } catch (error) {
    console.error('Ошибка обработки запроса:', error);
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
  }
}




export async function GET(req: NextRequest) {
  console.log(req)
  return NextResponse.json({ message: 'Этот маршрут поддерживает только POST-запросы' });
}