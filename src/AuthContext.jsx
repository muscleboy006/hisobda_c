import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from './Utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  useEffect(() => {
    // Проверяем, есть ли сохраненный токен
    const token = localStorage.getItem('token');
    
    if (token) {
      fetchUserProfile(token);
      return
    } 

    // Проверяем, доступен ли Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      
      // Получаем initData
      const initData = window.Telegram.WebApp.initData;
      
      if (initData) {
        // Отправляем initData на сервер для аутентификации
        handleTelegramInitDataAuth(initData);
      } else {
        console.warn('No initData available');
        setLoading(false);
      }
    } else {
      // Fallback: проверяем URL параметры (для тестирования или других случаев)
      checkUrlParams();
    }
  }, []);
  
  // Получение данных пользователя по токену
  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${api}/tg/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCurrentUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

    // Новый метод для отправки initData на сервер
    const handleTelegramInitDataAuth = async (initData) => {
      setLoading(true);
      setError(null);
      
      console.log('Processing Telegram initData:', initData);
      
      try {
        // Отправляем сырые initData на сервер
        const response = await axios.post(`${api}/tg/auth/telegram-initdata`, {
          initData: initData
        });
        
        if (response.data.success) {
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          setCurrentUser(user);
          console.log('Authentication successful:', user);
          return true;
        } else {
          setError(response.data.error || 'Ошибка аутентификации');
          console.error('Server returned error:', response.data.error);
          return false;
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(err.response?.data?.error || 'Ошибка сервера');
        return false;
      } finally {
        setLoading(false);
      }
    };
    
    // Fallback метод для URL параметров (оставляем для совместимости)
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const telegramData = {};
      let hasTelegramData = false;
      
      // Telegram отправляет несколько параметров, включая id, first_name, etc.
      for (const [key, value] of urlParams.entries()) {
        if (['id', 'first_name', 'last_name', 'gender', 'username', 'photo_url', 'auth_date', 'hash'].includes(key)) {
          telegramData[key] = value;
          hasTelegramData = true;
        }
      }
      
      // Если данные найдены в URL, обрабатываем их
      if (hasTelegramData) {
        handleTelegramAuth(telegramData);
        // Очищаем URL от параметров после обработки
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setLoading(false);
      }
    };  
  
  // Обработка данных аутентификации от Telegram
  const handleTelegramAuth = async (telegramData) => {
    setLoading(true);
    setError(null);
    
    console.log('Processing Telegram auth data:', telegramData);
    
    try {
      const response = await axios.post(`${api}/tg/auth/telegram`, telegramData);
      
      if (response.data.success) {
        const { user, token, walletId } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('walletId', walletId);
        setCurrentUser(user);
        console.log('Authentication successful:', user);
        return true;
      } else {
        setError(response.data.error || 'Ошибка аутентификации');
        console.error('Server returned error:', response.data.error);
        return false;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Ошибка сервера');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Выход из аккаунта
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  const value = {
    currentUser,
    loading,
    error,
    handleTelegramAuth,
    handleTelegramInitDataAuth,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
