import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import '../styles/SubjectIntro.css';

const SubjectIntro = ({ selectedSubject }) => {
  const { theme } = useContext(ThemeContext);
  
  const getSubjectInfo = (subject) => {
    const subjectData = {
      'Математика: сравнение величин': {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 20L11 4M13 20L17 4M19 16L3 16M19 8L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#19C37D',
        description: 'Готов помочь вам с задачами на сравнение величин, дробей, степеней и логарифмов. Задавайте вопросы или попросите тестовые задания.'
      },
      'Математика: задачи с вариантами ответов': {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="19" cy="8" r="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 10V18M12 14V6M19 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        color: '#4397FA',
        description: 'Готов помочь вам с решением математических задач с вариантами ответов. Используйте чат для вопросов или запроса тестовых заданий.'
      },
      'Аналогии и дополнение предложений': {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 15L7 17L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 15L17 17L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 13L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#9467FF',
        description: 'Готов помочь вам с заданиями на аналогии и дополнение предложений. Используйте чат для вопросов или запроса практики.'
      },
      'Чтение и понимание': {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.042C10.3516 4.56722 8.2144 3.74013 6 3.74013C4.94 3.74013 3.9244 3.93613 3 4.29213V18.4901C3.9244 18.1341 4.94 17.9401 6 17.9401C8.3584 17.9401 10.5756 18.7661 12 20.2911M12 6.042C13.6484 4.56722 15.7856 3.74013 18 3.74013C19.06 3.74013 20.0756 3.93613 21 4.29213V18.4901C20.0756 18.1341 19.06 17.9401 18 17.9401C15.7856 17.9401 13.6484 18.7661 12 20.2911M12 6.042V20.2911" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#FAB005',
        description: 'Готов помочь вам с работой с текстами, анализом информации и поиском главных мыслей. Используйте чат для вопросов или запроса тестовых заданий.'
      },
      'Пробное тестирование ОРТ': {
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7L12 13L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#EA723D',
        description: 'Готов помочь вам с пробным тестированием ОРТ. Вы можете проверить свои знания по всем разделам или выбрать конкретный раздел.'
      }
    };

    return subjectData[subject] || {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      color: '#EA723D',
      description: 'Выберите предмет из меню слева, и я помогу вам подготовиться к ОРТ.'
    };
  };

  const { icon, color, description } = getSubjectInfo(selectedSubject);

  return (
    <div className="subject-intro" style={{ backgroundColor: theme === 'dark' ? 'var(--color-message-ai-bg)' : 'var(--color-message-user-bg)' }}>
      <div className="subject-avatar" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="subject-content">
        <h2 className="subject-title">Предмет "{selectedSubject || 'OKUUM.AI'}"</h2>
        <p className="subject-description">{description}</p>
      </div>
    </div>
  );
};

export default SubjectIntro;
