import { DEMO_REQUEST_HONEYPOT } from '../model/demo-request';

/**
 * Скрытое поле-ловушка: человек его не видит и не заполняет, бот — заполняет.
 * Неуправляемое: значение читается из формы при отправке, поэтому ловит и
 * ботов, которые пишут в DOM мимо событий React.
 */
export function DemoRequestHoneypot() {
    return (
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
            <label htmlFor="demo-website">Сайт</label>
            <input id="demo-website" type="text" name={DEMO_REQUEST_HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
    );
}
