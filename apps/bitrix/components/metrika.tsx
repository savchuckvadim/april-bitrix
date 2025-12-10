"use client";

import { useEffect } from "react";

const YANDEX_ID = process.env.YANDEX_ID;

export function YandexMetrika() {
    useEffect(() => {
        // Чтобы не инициализировать дважды
        if (typeof window === "undefined") return;
        if ((window as any).ym) return;
        if (!YANDEX_ID) {
            console.warn("YANDEX_ID не задан в переменных окружения");
            return;
        }

        (function (m, e, t, r, i) {
            m[i] =
                m[i] ||
                function () {
                    (m[i].a = m[i].a || []).push(arguments);
                };
            m[i].l = Number(new Date());

            // Проверка на существующий скрипт
            for (let j = 0; j < e.scripts.length; j++) {
                if (e.scripts[j]?.src === r) return;
            }

            // Вот тут исправление: объявляем корректные типы
            let k: HTMLScriptElement = e.createElement(t) as HTMLScriptElement;
            let a: HTMLElement = e.getElementsByTagName(t)[0] as HTMLElement;

            k.async = true;
            k.src = r;
            a.parentNode?.insertBefore(k, a);
        })(
            window as any,
            document,
            "script",
            `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_ID}`,
            "ym"
        );

        (window as any).ym(Number(YANDEX_ID), "init", {
            ssr: true,
            webvisor: true,
            clickmap: true,
            trackLinks: true,
            ecommerce: "dataLayer",
            accurateTrackBounce: true,
        });
    }, []);

    if (!YANDEX_ID) {
        return null;
    }

    return (
        <noscript>
            <div>
                <img
                    src={`https://mc.yandex.ru/watch/${YANDEX_ID}`}
                    style={{ position: "absolute", left: "-9999px" }}
                    alt=""
                />
            </div>
        </noscript>
    );
}
