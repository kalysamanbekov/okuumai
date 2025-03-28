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
  highlight: function(code, lang) {
    // Здесь можно добавить подсветку синтаксиса, если нужно
    return code;
  }
});

/**
 * Преобразует текст в формате Markdown в безопасный HTML
 * @param {string} markdownText - Текст в формате Markdown
 * @returns {string} - Очищенный HTML
 */
export const renderMarkdown = (markdownText) => {
  if (!markdownText) return '';
  
  try {
    // Преобразуем Markdown в HTML
    const rawHtml = marked.parse(markdownText);
    
    // Настраиваем DOMPurify для разрешения безопасных тегов и атрибутов
    const purifyConfig = {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
        'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote',
        'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'span', 'div', 'sup', 'sub'
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'class', 'title',
        'width', 'height', 'style'
      ],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
      ADD_ATTR: ['target'], // Добавляем target для ссылок
      ALLOW_DATA_ATTR: false // Запрещаем data-атрибуты
    };
    
    // Очищаем HTML от потенциально опасных тегов и атрибутов
    const cleanHtml = DOMPurify.sanitize(rawHtml, purifyConfig);
    
    return cleanHtml;
  } catch (error) {
    console.error('Ошибка при рендеринге Markdown:', error);
    return `<p>Ошибка при форматировании текста: ${error.message}</p>`;
  }
};
