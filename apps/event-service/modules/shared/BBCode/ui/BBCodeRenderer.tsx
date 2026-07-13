import React from 'react';

interface BBCodeRendererProps {
  text: string;
  className?: string;
}

interface BBCodeTag {
  type: string;
  content: string;
  attributes?: Record<string, string>;
  children?: BBCodeTag[];
}

export const BBCodeRenderer: React.FC<BBCodeRendererProps> = ({ text, className = '' }) => {
  // Предварительная обработка текста для исправления распространенных ошибок
  const preprocessText = (input: string): string => {
    let processed = input;
    
    // Обрабатываем переносы строк
    processed = processed.replace(/\r\n/g, '\n');
    processed = processed.replace(/\r/g, '\n');
    
    // Исправляем только явно неправильные множественные скобки (3 и более)
    processed = processed.replace(/\[{3,}/g, '[');
    processed = processed.replace(/\]{3,}/g, ']');
    
    // Исправляем теги URL с неправильным регистром
    processed = processed.replace(/\[url=([^\]]+)\]/gi, '[URL=$1]');
    processed = processed.replace(/\[\/url\]/gi, '[/URL]');
    
    // Исправляем теги с неправильным регистром
    processed = processed.replace(/\[([a-z]+)=([^\]]+)\]/gi, (match, tag, attr) => {
      return `[${tag.toUpperCase()}=${attr}]`;
    });
    processed = processed.replace(/\[\/([a-z]+)\]/gi, (match, tag) => {
      return `[/${tag.toUpperCase()}]`;
    });
    
    return processed;
  };

  // Парсинг BBCode
  const parseBBCode = (input: string): BBCodeTag[] => {
    const result: BBCodeTag[] = [];
    let currentIndex = 0;
    
    while (currentIndex < input.length) {
      const openBracketIndex = input.indexOf('[', currentIndex);
      
      if (openBracketIndex === -1) {
        // Нет больше тегов, добавляем оставшийся текст
        if (currentIndex < input.length) {
          result.push({
            type: 'text',
            content: input.slice(currentIndex)
          });
        }
        break;
      }
      
      // Добавляем текст до открывающего тега
      if (openBracketIndex > currentIndex) {
        result.push({
          type: 'text',
          content: input.slice(currentIndex, openBracketIndex)
        });
      }
      
      const closeBracketIndex = input.indexOf(']', openBracketIndex);
      if (closeBracketIndex === -1) {
        // Не найден закрывающий тег, добавляем как текст
        result.push({
          type: 'text',
          content: input.slice(openBracketIndex)
        });
        break;
      }
      
      const tagContent = input.slice(openBracketIndex + 1, closeBracketIndex);
      
      // Проверяем, является ли это закрывающим тегом
      if (tagContent.startsWith('/')) {
        // Это закрывающий тег, добавляем как текст (не должно быть здесь)
        result.push({
          type: 'text',
          content: input.slice(openBracketIndex, closeBracketIndex + 1)
        });
        currentIndex = closeBracketIndex + 1;
        continue;
      }
      
      // Парсинг тега и атрибутов
      let tagName: string;
      let attributes: Record<string, string> = {};
      
      // Проверяем, есть ли атрибуты (знак равенства)
      const equalsIndex = tagContent.indexOf('=');
      
      if (equalsIndex !== -1) {
        tagName = tagContent.slice(0, equalsIndex).toUpperCase();
        const attrString = tagContent.slice(equalsIndex + 1);
        
        // Удаляем кавычки если они есть
        const cleanAttr = attrString.replace(/^["']|["']$/g, '');
        attributes.value = cleanAttr;
      } else {
        tagName = tagContent.toUpperCase();
      }
      
      // Поиск закрывающего тега
      const closingTag = `[/${tagName}]`;
      const closingTagIndex = input.indexOf(closingTag, closeBracketIndex);
      
      if (closingTagIndex === -1) {
        // Не найден закрывающий тег, добавляем как текст
        result.push({
          type: 'text',
          content: input.slice(openBracketIndex, closeBracketIndex + 1)
        });
        currentIndex = closeBracketIndex + 1;
        continue;
      }
      
      const innerContent = input.slice(closeBracketIndex + 1, closingTagIndex);
      
      // Рекурсивно парсим внутреннее содержимое
      const children = parseBBCode(innerContent);
      
      result.push({
        type: tagName,
        content: innerContent,
        attributes,
        children
      });
      
      currentIndex = closingTagIndex + closingTag.length;
    }
    
    return result;
  };
  
  // Рендеринг тегов
  const renderTags = (tags: BBCodeTag[]): React.ReactNode[] => {
    return tags.map((tag, index) => {
      switch (tag.type) {
        case 'text':
          // Обрабатываем переносы строк в тексте
          const textLines = tag.content.split('\n');
          if (textLines.length > 1) {
            return (
              <span key={index}>
                {textLines.map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </span>
            );
          }
          return <span key={index}>{tag.content}</span>;
          
        case 'B':
          return (
            <strong key={index}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </strong>
          );
          
        case 'I':
          return (
            <em key={index}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </em>
          );
          
        case 'U':
          return (
            <u key={index}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </u>
          );
          
        case 'S':
          return (
            <del key={index}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </del>
          );
          
        case 'URL':
          const url = tag.attributes?.url || tag.attributes?.href || tag.attributes?.value || tag.content;
          return (
            <a key={index} href={url} target="_blank" rel="noopener noreferrer">
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </a>
          );
          
        case 'USER':
          return (
            <span
              key={index}
              className="me-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </span>
          );
          
        case 'ICON':
          const iconUrl = tag.attributes?.url || tag.attributes?.src || tag.content;
          const title = tag.attributes?.title || '';
          return (
            <img 
              key={index} 
              src={iconUrl} 
              alt={title} 
              title={title}
              style={{ width: '20px', height: '20px', verticalAlign: 'middle' }}
              className="me-1"
            />
          );
          
        case 'COLOR':
          const color = tag.attributes?.value || '#000000';
          return (
            <span key={index} style={{ color }}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </span>
          );
          
        case 'SIZE':
          const size = tag.attributes?.size || tag.attributes?.value || '14';
          return (
            <span key={index} style={{ fontSize: `${size}px` }}>
              {tag.children && tag.children.length > 0 ? renderTags(tag.children) : tag.content}
            </span>
          );
          
        default:
          return <span key={index}>{tag.content}</span>;
      }
    });
  };
  
  // Обработка цитат (>>Текст)
  const processQuotes = (text: string): string => {
    return text.replace(/^>>(.+)$/gm, '｜$1');
  };
  
  // Обработка смайликов
  const processSmileys = (text: string): string => {
    const smileyMap: Record<string, string> = {
      ':D': '😄',
      ':-D': '😄',
      ';)': '😉',
      ';-)': '😉',
      ':)': '😊',
      ':-)': '😊',
      ':(': '😢',
      ':-(': '😢',
      ':P': '😛',
      ':-P': '😛',
      ';P': '😜',
      ';-P': '😜'
    };
    
    let processedText = text;
    Object.entries(smileyMap).forEach(([code, emoji]) => {
      processedText = processedText.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
    });
    
    return processedText;
  };
  
  // Основная обработка
  const preprocessedText = preprocessText(text);
  console.log('Original text:', text);
  console.log('Preprocessed text:', preprocessedText);
  
  const processedText = processQuotes(processSmileys(preprocessedText));
  const parsedTags = parseBBCode(processedText);
  console.log('Parsed tags:', parsedTags);
  
  return (
    <div className={className}>
      {renderTags(parsedTags)}
    </div>
  );
};