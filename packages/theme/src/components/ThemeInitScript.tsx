import React from 'react';
import { ColorSchemes } from '../model/color-schemes';

export interface ThemeInitScriptProps {
    /**
     * Обязан совпадать с `defaultTheme` у next-themes в этом приложении.
     * Понимает простые темы (`light` | `dark` | `system`) и составные
     * (`<схема>-<light|dark>`, например `air-dark`).
     *
     * Если значения разойдутся, первый кадр будет нарисован не той темой,
     * которую через мгновение поставит провайдер, — то есть вернётся ровно та
     * перекраска, ради устранения которой этот скрипт и нужен.
     */
    defaultTheme?: string;
}

/*
 * Инлайн-скрипт до гидратации (паттерн next-themes): читает сохранённые
 * theme / color-scheme / ui-scale / ui-glass и сразу ставит класс темы и схемы,
 * data-scale и data-glass на <html>.
 *
 * Зачем: тема живёт в localStorage, а сервер его не видит и рендерит страницу
 * нейтральной. Без этого скрипта первый кадр приходит светлым, и лишь после
 * гидратации (next-themes → AprilThemeProvider, а это ещё пара коммитов React)
 * страница перекрашивается — заметный «прыжок» темы, масштаба и стекла.
 * Скрипт синхронный: выполняется при разборе HTML, до первой отрисовки, и ждать
 * ему нечего — localStorage читается синхронно.
 *
 * Разбор темы обязан совпадать со splitTheme в provider/Theme.tsx: составная
 * тема `<схема>-<light|dark>` задаёт и схему, и режим, при этом собственный
 * выбор пользователя в `color-scheme` имеет приоритет над схемой из имени темы.
 * Наивное `scheme + '-' + theme` давало мусор вида `default-air-dark`, под
 * который нет ни одного правила CSS.
 *
 * Дефолт масштаба обязан совпадать с AprilThemeProvider: compact.
 *
 * ui-glass пишем только при явном выборе ('on'|'off'). Отсутствие атрибута —
 * это режим «как решит система»: CSS сам учтёт prefers-reduced-transparency
 * (см. tokens/effects.css).
 *
 * Рендерить в корневом layout ПЕРЕД контентом.
 */
const buildInitCode = (defaultTheme: string) => `(function(){try{
var d=document.documentElement;
var schemes=${JSON.stringify([...ColorSchemes])};
d.dataset.scale=localStorage.getItem('ui-scale')||'compact';

var t=localStorage.getItem('theme')||${JSON.stringify(defaultTheme)};
if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
/* класс самой темы — его же поставит next-themes с attribute="class" */
d.classList.add(t);

var s=localStorage.getItem('color-scheme');
var mode=t;
var i=t.lastIndexOf('-');
if(i>0){
var prefix=t.slice(0,i),suffix=t.slice(i+1);
if((suffix==='light'||suffix==='dark')&&schemes.indexOf(prefix)!==-1){mode=suffix;if(!s){s=prefix;}}
}
mode=mode==='dark'?'dark':'light';
if(schemes.indexOf(s)===-1){s='default';}
d.classList.add(s+'-'+mode);
d.style.colorScheme=mode;

var g=localStorage.getItem('ui-glass');
if(g==='on'||g==='off'){d.dataset.glass=g;}
}catch(e){}})();`;

export const ThemeInitScript = ({
    defaultTheme = 'light',
}: ThemeInitScriptProps) => (
    <script dangerouslySetInnerHTML={{ __html: buildInitCode(defaultTheme) }} />
);
