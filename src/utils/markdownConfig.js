import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Настройка опций для marked
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Переносы строк преобразуются в <br>
  headerIds: false, // Отключаем автоматические id для заголовков
  mangle: false, // Отключаем экранирование email-адресов
  smartLists: true, // Улучшенные списки
  smartypants: true, // Типографские кавычки, тире и т.д.
  pedantic: false, // Соответствие спецификации CommonMark
  xhtml: false, // Использовать закрывающие теги для пустых элементов
  highlight: function(code, lang) {
    // Здесь можно добавить подсветку синтаксиса, если нужно
    return code;
  }
});

// Настройка парсера для потокового режима
const renderer = new marked.Renderer();

// Настраиваем рендерер для лучшей обработки частичных фрагментов
renderer.paragraph = (text) => `<p>${text}</p>`;
renderer.list = (body, ordered) => {
  const type = ordered ? 'ol' : 'ul';
  return `<${type}>${body}</${type}>`;
};
renderer.listitem = (text) => `<li>${text}</li>`;

marked.use({ renderer });

/**
 * Преобразует текст в формате Markdown в безопасный HTML
 * @param {string} markdownText - Текст в формате Markdown
 * @returns {string} - Очищенный HTML
 */
export const renderMarkdown = (markdownText) => {
  if (!markdownText) return '';
  
  try {
    console.log('Обработка Markdown:', markdownText);
    
    // Преобразуем Markdown в HTML
    // Добавляем проверку на незавершенные теги Markdown
    let processedText = markdownText;
    
    // Добавляем пробелы для корректной обработки заголовков
    processedText = processedText.replace(/^(#{1,6})([^\s])/gm, '$1 $2');
    
    // Преобразуем Markdown в HTML
    const rawHtml = marked.parse(processedText);
    
    // Настраиваем DOMPurify для разрешения безопасных тегов и атрибутов
    const purifyConfig = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
        'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote',
        'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div', 'sup', 'sub', 'b', 'i', 'u', 'strike', 'del'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'class', 'title',
        'width', 'height', 'style'
      ],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
      ADD_ATTR: ['target'], // Добавляем target для ссылок
      ALLOW_DATA_ATTR: false, // Запрещаем data-атрибуты
      RETURN_DOM_FRAGMENT: false, // Возвращаем строку, а не DOM-фрагмент
      RETURN_DOM: false,
      SANITIZE_DOM: true
    };
    
    // Очищаем HTML от потенциально опасных тегов и атрибутов
    const cleanHtml = DOMPurify.sanitize(rawHtml, purifyConfig);
    
    console.log('Преобразованный HTML:', cleanHtml);
    return cleanHtml;
  } catch (error) {
    console.error('Ошибка при рендеринге Markdown:', error);
    return `<p>Ошибка при форматировании текста: ${error.message}</p>`;
  }
};

// Функция для тестирования Markdown
export const testMarkdown = () => {
  const testCases = [
    '# Заголовок 1',
    '## Заголовок 2',
    '**Жирный текст**',
    '*Курсив*',
    '- Элемент списка',
    '1. Нумерованный список',
    '```
Код
```',
    '> Цитата'
  ];
  
  testCases.forEach(test => {
    console.log('Тест:', test);
    console.log('Результат:', renderMarkdown(test));
  });
};
