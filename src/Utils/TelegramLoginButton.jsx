import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const TelegramLoginButton = () => {
  const { handleTelegramAuth } = useAuth();
  const navigate = useNavigate();
  const telegramBtnRef = useRef(null);

  useEffect(() => {
    // Определяем функцию обработки данных от Telegram ДО загрузки скрипта
    window.onTelegramAuth = async (user) => {
      console.log('Telegram auth callback received:', user);
      const success = await handleTelegramAuth(user);
      if (success) {
        console.log('Authentication successful, navigating to profile');
        navigate('/dashboard');
      } else {
        console.error('Authentication failed');
      }
    };

    // Добавляем скрипт Telegram
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'hisobda_app_bot'); // Замените на имя вашего бота
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-radius', '8');
    
    // Убедимся, что предыдущий скрипт удален
    const existingScript = document.querySelector('script[data-telegram-login]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Добавляем скрипт в DOM
    if (telegramBtnRef.current) {
      telegramBtnRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }

    return () => {
      // Удаляем скрипт при размонтировании компонента
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Не удаляем колбэк, чтобы он был доступен при перенаправлении от Telegram
    };
  }, [handleTelegramAuth, navigate]);

  return (
    <div className="flex flex-col items-center">
      <div ref={telegramBtnRef} className="telegram-login-button mb-4">
        {/* Здесь будет размещена кнопка Telegram Login */}
      </div>
      <div className="text-center text-sm text-gray-500 mt-2">
        Agar tugma yuklanmagan bolsa, internetni tekshiring yoki sahifani yangilang
      </div>
    </div>
  );
};

export default TelegramLoginButton;