import React from 'react';

/*
 * Инлайн-скрипт до гидрации (паттерн next-themes): читает сохранённые
 * color-scheme / ui-scale / ui-glass и сразу ставит класс схемы, data-scale
 * и data-glass на <html> — без него до маунта AprilThemeProvider виден
 * «прыжок» темы, масштаба и стекла.
 * Дефолты обязаны совпадать с AprilThemeProvider: default / compact.
 * Рендерить в корневом layout ПЕРЕД контентом.
 *
 * ui-glass пишем только при явном выборе ('on'|'off'). Отсутствие атрибута —
 * это режим «как решит система»: CSS сам учтёт prefers-reduced-transparency
 * (см. tokens/effects.css).
 */
const INIT_CODE = `(function(){try{
var d=document.documentElement;
d.dataset.scale=localStorage.getItem('ui-scale')||'compact';
var s=localStorage.getItem('color-scheme')||'default';
var t=localStorage.getItem('theme')||'light';
if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
d.classList.add(s+'-'+t);
var g=localStorage.getItem('ui-glass');
if(g==='on'||g==='off'){d.dataset.glass=g;}
}catch(e){}})();`;

export const ThemeInitScript = () => (
    <script dangerouslySetInnerHTML={{ __html: INIT_CODE }} />
);
