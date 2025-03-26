const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Настройка транспорта для отправки email
// Примечание: для продакшена рекомендуется использовать реальный SMTP сервер
const transporter = nodemailer.createTransport({
  service: 'gmail', // Можно заменить на другой сервис
  auth: {
    user: 'your-email@gmail.com', // Замените на реальный email
    pass: 'your-app-password' // Замените на пароль приложения (не обычный пароль)
  }
});

// Email администраторов, которые будут получать уведомления
const adminEmails = ['admin1@example.com', 'admin2@example.com'];

/**
 * Функция для отправки уведомления об оплате
 * Срабатывает при создании или обновлении документа пользователя в Firestore
 * с полем payment_status = 'pending'
 */
exports.sendPaymentNotification = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    // Получаем данные после изменения
    const newData = change.after.data();
    // Получаем данные до изменения (если документ существовал)
    const previousData = change.before.exists ? change.before.data() : null;
    
    // Проверяем, является ли это новым платежом
    const isNewPayment = newData && 
                        newData.payment_status === 'pending' && 
                        (!previousData || previousData.payment_status !== 'pending');
    
    if (!isNewPayment) {
      console.log('Это не новый платеж, уведомление не отправляется');
      return null;
    }
    
    // Получаем ID пользователя из контекста
    const userId = context.params.userId;
    
    try {
      // Получаем дополнительную информацию о пользователе
      const userRecord = await admin.auth().getUser(userId);
      
      // Формируем содержимое email
      const mailOptions = {
        from: 'OKUUM.AI <your-email@gmail.com>',
        to: adminEmails.join(','),
        subject: 'Новый платеж в OKUUM.AI',
        html: `
          <h2>Получен новый платеж</h2>
          <p><strong>Дата:</strong> ${new Date(newData.payment_submitted_at.toDate()).toLocaleString()}</p>
          <p><strong>ФИО плательщика:</strong> ${newData.payment_full_name}</p>
          <p><strong>Email пользователя:</strong> ${userRecord.email}</p>
          <p><strong>Скриншот об оплате:</strong> <a href="${newData.payment_screenshot_url}" target="_blank">Посмотреть</a></p>
          <p><strong>ID пользователя:</strong> ${userId}</p>
          <hr>
          <p>Для подтверждения платежа перейдите в <a href="https://console.firebase.google.com/project/okkumai/firestore/data/~2Fusers~2F${userId}">панель администратора</a>.</p>
        `
      };
      
      // Отправляем email
      await transporter.sendMail(mailOptions);
      console.log('Уведомление об оплате успешно отправлено');
      
      // Обновляем статус платежа на 'notified'
      await admin.firestore().collection('users').doc(userId).update({
        payment_notification_sent: true,
        payment_notification_sent_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
      return null;
    }
  });

/**
 * Функция для обновления статуса пользователя после подтверждения оплаты
 * Используется администратором через HTTP-запрос
 */
exports.confirmPayment = functions.https.onCall(async (data, context) => {
  // Проверяем, является ли вызывающий администратором
  // В реальном приложении здесь должна быть проверка прав доступа
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Требуется аутентификация');
  }
  
  const { userId, adminNotes } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'Требуется ID пользователя');
  }
  
  try {
    // Обновляем статус платежа на 'confirmed'
    await admin.firestore().collection('users').doc(userId).update({
      payment_status: 'confirmed',
      payment_confirmed_at: admin.firestore.FieldValue.serverTimestamp(),
      payment_confirmed_by: context.auth.uid,
      admin_notes: adminNotes || '',
      subscription_active: true,
      subscription_start_date: admin.firestore.FieldValue.serverTimestamp(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
    });
    
    // Отправляем уведомление пользователю о подтверждении платежа
    // Здесь можно добавить отправку email пользователю
    
    return { success: true, message: 'Платеж подтвержден' };
  } catch (error) {
    console.error('Ошибка при подтверждении платежа:', error);
    throw new functions.https.HttpsError('internal', 'Ошибка при подтверждении платежа');
  }
});

/**
 * Функция для отклонения платежа
 * Используется администратором через HTTP-запрос
 */
exports.rejectPayment = functions.https.onCall(async (data, context) => {
  // Проверяем, является ли вызывающий администратором
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Требуется аутентификация');
  }
  
  const { userId, rejectionReason } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'Требуется ID пользователя');
  }
  
  try {
    // Обновляем статус платежа на 'rejected'
    await admin.firestore().collection('users').doc(userId).update({
      payment_status: 'rejected',
      payment_rejected_at: admin.firestore.FieldValue.serverTimestamp(),
      payment_rejected_by: context.auth.uid,
      rejection_reason: rejectionReason || 'Платеж отклонен'
    });
    
    // Отправляем уведомление пользователю об отклонении платежа
    // Здесь можно добавить отправку email пользователю
    
    return { success: true, message: 'Платеж отклонен' };
  } catch (error) {
    console.error('Ошибка при отклонении платежа:', error);
    throw new functions.https.HttpsError('internal', 'Ошибка при отклонении платежа');
  }
});
