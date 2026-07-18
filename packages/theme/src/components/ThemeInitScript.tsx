import React from 'react';

/*
 * Инлайн-скрипт до гидрации (паттерн next-themes): читает сохранённые
 * color-scheme / ui-scale и сразу ставит класс схемы и data-scale на <html> —
 * без него до маунта AprilThemeProvider виден «прыжок» темы и масштаба.
 * Дефолты обязаны совпадать с AprilThemeProvider: default / compact.
 * Рендерить в корневом layout ПЕРЕД контентом.
 */
const INIT_CODE = `(function(){try{
var d=document.documentElement;
d.dataset.scale=localStorage.getItem('ui-scale')||'compact';
var s=localStorage.getItem('color-scheme')||'default';
var t=localStorage.getItem('theme')||'light';
if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
d.classList.add(s+'-'+t);
}catch(e){}})();`;

export const ThemeInitScript = () => (
    <script dangerouslySetInnerHTML={{ __html: INIT_CODE }} />
);
