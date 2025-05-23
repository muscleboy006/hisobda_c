import axios from 'axios';
import { useEffect, useState } from 'react';
import api from './api';

export const useAccessStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEndsAt, setPremiumEndsAt] = useState(null);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const token = localStorage.getItem('token'); // или замени на cookie, если используешь
        const res = await axios.get(`${api}/tg/access-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { isPremium, premiumEndsAt } = res.data;

        setIsPremium(isPremium);
        setPremiumEndsAt(premiumEndsAt);
      } catch (err) {
        setIsPremium(false);
        setPremiumEndsAt(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccess();
  }, []);

  return { isPremium, premiumEndsAt, isLoading };
};
