# nginx-конфиги фронтов

Хост-nginx (не в контейнере) терминирует TLS и проксирует на порты, которые
`docker-compose.prod.yml` пробрасывает наружу. Порты — в `front/.env`.

Источник правды — этот репозиторий: [`next.april-app.ru.conf`](./next.april-app.ru.conf),
все клиентские фронты на одном домене, каждый под своим префиксом. На сервер файл
копируется (см. «Установка»); правки на сервере руками сразу переносить сюда.
`event-next.april-app.ru.conf` и `old.conf` — локальная история вне git, на сервер их
не копировать: в первом старые порты и петля редиректов на `/sales`. У admin и bitrix
свои домены, здесь их нет.

| URL                              | приложение    | контейнер               | порт | basePath       |
| -------------------------------- | ------------- | ----------------------- | ---- | -------------- |
| `next.april-app.ru/`             | kpi-sales     | `april-kpi-sales-*`     | 5034 | нет            |
| `next.april-app.ru/kpi-sales/`   | kpi-sales     | `april-kpi-sales-*`     | 5034 | нет            |
| `next.april-app.ru/sales`        | event-sales   | `front-event-sales-*`   | 5031 | `/sales`       |
| `next.april-app.ru/service`      | event-service | `front-event-service-*` | 5038 | `/service`     |
| `next.april-app.ru/konstructor`  | konstructor   | `front-konstructor-*`   | 5035 | `/konstructor` |
| `next.april-app.ru/kpi-service`  | kpi-service   | `april-kpi-service-*`   | 5037 | `/kpi-service` |

Новых поддоменов нет — сертификат прежний, certbot не нужен.

> **Не путать с бэками.** `app-event-service` (8227), `app-konstructor` (8228),
> `app-event-sales` (8226) и остальные `app-*` на 82xx — это Nest-сервисы.

> **Порты сверять по `docker ps`, а не по `front/.env`.** Серверный `.env`
> расходится с репозиторным: event-sales поднялся на **5031** (в репо было
> 5036), konstructor — на 5035 (в репо 5000). Причём 5031 в репозиторном
> `.env` занят под `PORT_WEB` — если `web` когда-нибудь включат в деплой,
> будет конфликт.

> **Контейнера event-service пока нет** — его `location`-блоки включены, поэтому
> `/service` отвечает 502, пока контейнер не поднят; остальных это не задевает.
> Порт 5038 взят из репозиторного `.env`, на сервере сверить:
> `grep PORT_EVENT_SERVICE .env`.

> **`upstream`-блоки только у приложений под префиксом.** Имена уникальны:
> два файла в `sites-enabled` с одинаковым `upstream <name>` роняют `nginx -t`.
> kpi-sales исторически ходит напрямую на `localhost:PORT`.

> **Настройки прокси лежат на уровне `server`** и наследуются всеми блоками без
> своих `proxy_set_header`. У kpi-sales всё задано явно, включая таймауты 60s,
> поэтому общие настройки его не задевают.

> **CORS.** Браузер ходит в API сервисов напрямую, поэтому в `CORS_ORIGIN` каждого
> API должен быть `https://next.april-app.ru`. На 31.10 его нет только у
> `api.konstructor.april-app.ru`. Проверка:
> `curl -si -X OPTIONS <url> -H 'Origin: https://next.april-app.ru' -H 'Access-Control-Request-Method: POST' | grep -i allow-origin`

## Почему у kpi-sales префикс режется, а у остальных нет

У kpi-sales `/kpi-sales/` и `/` смотрят в **один и тот же** контейнер. Поэтому
`rewrite ^/kpi-sales(/.*)$ $1 break` безопасен: приложение отдаёт HTML со
ссылками на `/_next/*`, браузер идёт в корень домена — и попадает туда же.

Для остальных корень домена занят чужим приложением. Если отрезать префикс:

- `/_next/static/chunks/*` уйдут в kpi-sales → чужие/несуществующие бандлы;
- клиентская навигация (`/item`, `/finish`) и RSC-запросы уйдут туда же.

Поэтому `apps/event-sales` и `apps/event-service` собираются с `basePath`
([event-sales/next.config.ts](../../apps/event-sales/next.config.ts),
[event-service/next.config.ts](../../apps/event-service/next.config.ts)),
а nginx префикс **не режет**. Внешний URL при этом обычный:
`next.april-app.ru/sales` показывает корневую страницу приложения.

Что `basePath` делает автоматически: `next/link`, `useRouter`, `redirect`,
`/_next/*`, статические импорты картинок. Что **не** делает: голый
`fetch('/api/...')`, `window.location`, `window.open`, `new URL('/x', req.url)`
в route-хендлерах и строковый `src` у `next/image` (`src="/logo.svg"`). Такие
места префиксуются вручную через `process.env.NEXT_PUBLIC_BASE_PATH`
(см. `modules/app/lib/helper/logClient.ts` в event-sales и event-service).

Приложения на домене делят origin, а с ним `localStorage` и IndexedDB. Тема и
масштаб (`theme`, `color-scheme`, `ui-scale`) общие для всех. Кэш `swrCache`
не пересекается: у ключей разные имена. Новый ключ называть с именем приложения.

`basePath` включается **только при `NODE_ENV=production`** (т.е. на
`next build`). В `next dev` его нет — `localhost:3000` работает без префикса,
как и раньше. `NEXT_PUBLIC_BASE_PATH` в CI не передаётся, поэтому берутся
дефолты из `next.config.ts`. Менять префикс — там (+ `location` в nginx).

> Healthcheck в `docker-compose.prod.yml` дёргает `http://127.0.0.1:3000` —
> с basePath это отдаст 404, но проверка засчитывает **любой** HTTP-ответ,
> так что контейнер остаётся healthy. Если её ужесточат до «код 200» —
> целевой URL надо поменять на префикс приложения.

## Голые пути в приложениях с basePath

Всё, что строится руками, проходит через `withBasePath`:
`modules/app/lib/utills/base-path.ts` в event-sales и event-service,
`modules/shared/lib/base-path.ts` в konstructor и kpi-service. У kpi-service
`basePath` задан в `next.config.mjs`: рабочий конфиг он, `next.config.ts` рядом мёртв.

Адрес публичных ссылок конструктора собирается в админке из
[`KONSTRUCTOR_APP_URL`](../../apps/admin/modules/entities/konstructor/public-link/consts/public-link.consts.ts).

В замороженной зоне konstructor `/offer` пути без префикса оставлены намеренно
(`OfferPreviewPage.tsx`, `OfferTemplateThunk.ts`, картинки шаблонов и шрифты
`style/fonts.css`, которые применяет только её `FontSelector`). Разморозят зону —
их нужно будет поправить.

## POST и Bitrix placement

Bitrix открывает обработчик приложения `POST`-ом, а страницы Next App Router
на POST отвечают `405`. Поэтому POST на страницу переводится в GET через
`303` на тот же URI (`return 303 $request_uri` — сохраняет query плейсмента).

Тело POST при этом теряется — это безопасно: приложения берут auth и placement
из BX24-фрейма (`bitrix.api.getPlacement()` в `@workspace/bitrix`), а не из тела
запроса. У konstructor так работают оба входа: сделка (`CRM_DEAL_*`) и компания
(`CRM_COMPANY_*`, сделку находит `pickCompanyDeal`).

### Страницы vs route-хендлеры

405 на POST отдают только **страницы** (`page.tsx`). **Route-хендлеры**
(`app/**/route.ts`) POST принимают штатно — как `apps/kpi-sales/app/api/bitrix/app/route.ts`,
который сам логирует тело и возвращает `303` на `/report`.

Поэтому из 303-правила вынесены `/<префикс>/api/` отдельными `location ^~`: без
этого клиентский логгер (`logClient` → `POST /sales/api/admin/logs`) получал бы
редирект вместо записи, а публичная ссылка конструктора
(`POST /konstructor/api/public/<token>/description`) — вместо файла.

### kpi-sales — намеренно как было

У kpi-sales такого выноса **нет**: правило `POST → 303 /kpi-sales/report`
накрывает весь префикс, поэтому до Next не доходят POST-ы на
`/kpi-sales/api/bitrix/app`, `/api/bitrix/install`, `/api/share/*`,
`/api/admin/logs` — nginx отвечает раньше. Значит `route.ts`-хендлер
`api/bitrix/app` в этой схеме недостижим, а редирект делает именно nginx.

Оставлено как есть: install/handler не используются, внешнего API не будет,
а в таком виде это работает в проде. Если понадобится оживить какой-то
route-хендлер под `/kpi-sales/` — добавить для него `location ^~` выше
(как у остальных приложений).

> Если в приложениях появятся Server Actions — они ходят POST-ом на URL
> страницы, и правило их сломает. Тогда исключать по заголовку:
> ```nginx
> set $post_page "";
> if ($request_method = POST) { set $post_page "P"; }
> if ($http_next_action)      { set $post_page "${post_page}A"; }
> if ($post_page = "P")       { return 303 $request_uri; }
> ```

## Предусловие: контейнеры должны быть подняты

Проксировать нечего, пока на сервере нет `front-event-sales-*` /
`front-event-service-*`. Деплой-скрипт
(`.github/workflows/deploy-front-prod.yml`) **молча пропускает** приложение,
у которого на сервере пустой `apps/<app>/.env`:

```bash
if [ ! -s "apps/$app/.env" ]; then
  echo "⚠️ apps/$app/.env пуст — пропускаю $svc"; continue
fi
```

и сам же создаёт пустые заглушки для отсутствующих файлов. Поэтому
`docker ps` показывает `april-kpi-sales-prod`, `front-bitrix-prod` и т.д.,
но не event-*. Чинится на сервере:

```bash
cd /var/www/html/next/monorepo
# 1. заполнить .env — состав в apps/<app>/.env.example
ls -l apps/event-sales/.env apps/event-service/.env

# 2. проверить порты в корневом .env — они там СВОИ, не как в репозитории
#    (например konstructor на сервере 5035, а в репо PORT_KONSTRUCTOR=5000)
grep PORT_EVENT .env

# 3. поднять
COMPOSE="docker compose --env-file .env -f docker-compose.prod.yml"
$COMPOSE pull front-event-sales front-event-service
$COMPOSE up -d front-event-sales front-event-service
```

Если `PORT_EVENT_SERVICE` на сервере отличается от 5038 — поправить порт в
`upstream event_service_app`.

## Завершающий слэш: канонический URL — `/sales`, БЕЗ слэша

У Next `trailingSlash: false` (дефолт), поэтому приложение само отвечает
`308` на `/sales/` → `/sales`. Если nginx редиректит встречно
(`location = /sales { return 308 /sales/; }`), получается **бесконечная петля**
и браузер показывает `ERR_TOO_MANY_REDIRECTS`. На этом уже один раз слёг прод.

Правило: `/sales` без слэша **проксируется** (его ловит `location ~ ^/sales(/|$)`).
Нормализацию слэша отдаём Next — он и query сохранит. Редирект `/sales` → `/sales/`
в nginx не добавлять.

Симптом в диагностике выглядит так (оба конца 308):

```
GET :5031/sales/  -> 308      # редиректит сам Next
GET /sales        -> 308 -> /sales/
GET /sales/       -> 308      # обратно на /sales
```

## Если `/sales` не открывается — где смотреть

Первым делом разделить «сломан nginx» и «сломано приложение». Проверка мимо
nginx, прямо в контейнер (на сервере):

```bash
curl -sI http://127.0.0.1:5031/sales    # ожидаем 200
curl -sI http://127.0.0.1:5031/         # ожидаем 404 (basePath работает)
```

- **200 на `/sales`** → образ собран правильно, проблема в nginx: смотреть
  `ls -l /etc/nginx/sites-enabled/` на второй конфиг с тем же `server_name`
  (побеждает загруженный первым — отсюда «kpi-sales работает, /sales нет»)
  и `tail -f /var/log/nginx/error.log`.
- **404 на `/sales` и 200 на `/`** → образ собран **без** `basePath`.
  Конфиг ни при чём: пересобрать/передеплоить `front-event-sales`.
- **308 с обеих сторон** → петля со слэшем, см. раздел выше.
- **Пусто / connection refused** → контейнер не слушает 5031, сверить `docker ps`.

## Установка

Деплой-клон на сервере обновляется при каждом деплое фронта, файл берём оттуда.
Сам деплой конфиг не применяет: ошибка в nginx положит все приложения сразу,
поэтому применение остаётся осознанным шагом с `nginx -t`.

```bash
cd /var/www/html/next/monorepo
git log -1 --format=%h -- deploy/nginx/next.april-app.ru.conf   # та ли версия
sudo cp /etc/nginx/sites-available/next.april-app.ru /root/next.april-app.ru.bak
sudo cp deploy/nginx/next.april-app.ru.conf /etc/nginx/sites-available/next.april-app.ru
sudo nginx -t && sudo systemctl reload nginx
```

Правка только в `deploy/nginx/**` деплой не запускает (нет в `paths` workflow).
Тогда клон обновляется руками: `git fetch origin main && git reset --hard origin/main`.

Проверка:

```bash
curl -sI https://next.april-app.ru/                    # 200, kpi-sales
curl -sI https://next.april-app.ru/kpi-sales/report    # 200, kpi-sales
curl -sI https://next.april-app.ru/sales         # 200, event-sales (канон)
curl -sI https://next.april-app.ru/sales/        # 308 -> /sales (нормализует Next)
curl -sI https://next.april-app.ru/service       # 200, event-service (502 — контейнер не поднят)
curl -sI https://next.april-app.ru/konstructor   # 200, konstructor (404 — старый образ без basePath)
curl -sI https://next.april-app.ru/kpi-service/report/kpi   # 200, kpi-service (404 — старый образ без basePath)
curl -sI -X POST https://next.april-app.ru/sales    # 303 -> /sales
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://next.april-app.ru/konstructor/api/public/x/description  # не 303

curl -s https://next.april-app.ru/sales | grep -o '/sales/_next[^"]*' | head
```

Последняя строка должна выдать пути `/sales/_next/...` — если пусто
и видно `/_next/...`, значит приложение пересобрано без `basePath`.

## Что прописать в Bitrix24

- **event-sales** — обработчик и placement: `https://next.april-app.ru/sales`
- **event-service** — обработчик и placement: `https://next.april-app.ru/service`
- **konstructor** — обработчик и placement сделки и компании: `https://next.april-app.ru/konstructor`
- **kpi-service** — обработчик: `https://next.april-app.ru/kpi-service/report/kpi`
  (корневая страница приложения пустая)

**Без** слэша на конце — иначе лишний хоп через 308 от Next.
