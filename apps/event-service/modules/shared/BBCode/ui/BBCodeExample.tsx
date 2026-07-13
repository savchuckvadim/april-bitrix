import React from 'react';
import { BBCodeRenderer } from './BBCodeRenderer';

export const BBCodeExample: React.FC = () => {
  const sampleText = `
    [B]Добро пожаловать![/B] :D

    >>Это важная цитата с [I]форматированием[/I]

    [USER=123]Иван Петров[/USER] написал: [COLOR=#ff0000]Привет всем![/COLOR]

    Посетите наш сайт: [URL=https://example.com]example.com[/URL]

    [SIZE=18][B][COLOR=#0000ff]Синий заголовок большого размера[/COLOR][/B][/SIZE]

    [ICON=https://em-content.zobj.net/thumbs/120/apple/325/smiling-face-with-smiling-eyes_1f60a.png title=Улыбка] Смайлик
  `;

  // Проблемный текст из пользовательского запроса
  const problematicText = `(5918085) Пользователь не смог войти в систему ГАРАНТ (ввод неправильного пароля) (2325) [COLOR=#0070c0][B]Организация Клиента[/B][/COLOR]: Скасырская Наталья Геннадьевна [COLOR=#0070c0][B]Карточка клиента[/B][/COLOR]: 61-40762-000623 [COLOR=#0070c0][B]ID комплекта[/B][/COLOR]: [U][I][url=http://service.garant.ru/userActivity/?rpId=61-40762&clientId=61-40762-000623&infoId=1&complectId=2325]2325[/url][/I][/U] [COLOR=#0070c0][B]ФИО пользователя[/B][/COLOR]: Скасырская Наталья Геннадьевна [COLOR=#0070c0][B]Телефон пользователя[/B][/COLOR]: +79819837859 [COLOR=#0070c0][B]Логин пользователя[/B][/COLOR]: skasyrskayanatalia@gmail.com [COLOR=#0070c0][B]Неудачная попытка входа: 24.07.2025 18:44:57[/B][/COLOR]: [COLOR=#f00000][B]Не забудьте [U][I][url=http://service.garant.ru/bitrix/signal?cid=5918085]оценить[/url][/I][/U] правильность сигнала, поставив оценку в задаче.[/B][/COLOR]`;

  // Текст с исправленными тегами для сравнения
  const fixedText = `(5918085) Пользователь не смог войти в систему ГАРАНТ (ввод неправильного пароля) (2325) [COLOR=#0070c0][B]Организация Клиента[/B][/COLOR]: Скасырская Наталья Геннадьевна [COLOR=#0070c0][B]Карточка клиента[/B][/COLOR]: 61-40762-000623 [COLOR=#0070c0][B]ID комплекта[/B][/COLOR]: [U][I][URL=http://service.garant.ru/userActivity/?rpId=61-40762&clientId=61-40762-000623&infoId=1&complectId=2325]2325[/URL][/I][/U] [COLOR=#0070c0][B]ФИО пользователя[/B][/COLOR]: Скасырская Наталья Геннадьевна [COLOR=#0070c0][B]Телефон пользователя[/B][/COLOR]: +79819837859 [COLOR=#0070c0][B]Логин пользователя[/B][/COLOR]: skasyrskayanatalia@gmail.com [COLOR=#0070c0][B]Неудачная попытка входа: 24.07.2025 18:44:57[/B][/COLOR]: [COLOR=#f00000][B]Не забудьте [U][I][URL=http://service.garant.ru/bitrix/signal?cid=5918085]оценить[/URL][/I][/U] правильность сигнала, поставив оценку в задаче.[/B][/COLOR]`;

  // Простой тест с правильным BBCode
  const simpleTest = `[COLOR=#0070c0][B]Организация Клиента[/B][/COLOR]: Скасырская Наталья Геннадьевна`;

  return (
    <div className="p-3">
      <h3>Пример использования BBCodeRenderer:</h3>
      <div className="border p-3 rounded">
        <BBCodeRenderer text={sampleText} />
      </div>

      <h4 className="mt-4">Простой тест с правильным BBCode:</h4>
      <div className="border p-3 rounded bg-light">
        <BBCodeRenderer text={simpleTest} />
      </div>
      <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>{simpleTest}</pre>

      <h4 className="mt-4">Тест с проблемным текстом (до исправления):</h4>
      <div className="border p-3 rounded bg-light">
        <BBCodeRenderer text={problematicText} />
      </div>

      <h4 className="mt-4">Тест с исправленным текстом (после исправления):</h4>
      <div className="border p-3 rounded bg-light">
        <BBCodeRenderer text={fixedText} />
      </div>

      <h4 className="mt-4">Отдельные примеры:</h4>
      <div className="border p-3 rounded">
        <p><BBCodeRenderer text="[B]Полужирный[/B] и [I]курсивный[/I] текст" /></p>
        <p><BBCodeRenderer text="[U]Подчеркнутый[/U] и [S]зачеркнутый[/S] текст" /></p>
        <p><BBCodeRenderer text="Смайлики: :D ;-) :) :( :P" /></p>
        <p><BBCodeRenderer text="[COLOR=#ff0000]Красный[/COLOR] и [COLOR=#00ff00]зеленый[/COLOR] текст" /></p>
        <p><BBCodeRenderer text="[SIZE=20]Большой[/SIZE] и [SIZE=10]маленький[/SIZE] текст" /></p>
        <p><BBCodeRenderer text="[USER=123]Иван Петров[/USER] упомянул пользователя" /></p>
        <p><BBCodeRenderer text="[URL=https://example.com]Ссылка на сайт[/URL]" /></p>
      </div>

      <h4 className="mt-4">Тест исправления неправильных тегов:</h4>
      <div className="border p-3 rounded bg-light">
        <p><BBCodeRenderer text="Неправильный закрывающий тег: /COLOR] текст" /></p>
        <p><BBCodeRenderer text="Тег без скобки: COLOR=#ff0000] красный текст" /></p>
        <p><BBCodeRenderer text="[COLOR=#ff0000]Красный текст[/COLOR] и /B] неправильный" /></p>
      </div>
    </div>
  );
};