import { permanentRedirect } from 'next/navigation';
import { AI_CALIBRATION_PATH } from '../constants/calibration-contacts';

/**
 * Калибровка переехала в базу знаний «AI для отдела продаж»: бриф и программа
 * настройки методики — часть описания продукта, а не рассказа о том, как мы
 * работаем.
 *
 * Редирект постоянный (308): старый адрес разошёлся по письмам и презентациям,
 * и поисковику надо сказать, что страница именно переехала, а не пропала.
 * Печатная версия брифа (`/how-we-work/calibration/brief`) осталась по своему
 * адресу — редирект точечный и её не задевает.
 */
export default function CalibrationPage() {
    permanentRedirect(AI_CALIBRATION_PATH);
}
