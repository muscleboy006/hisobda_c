// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import api from './api';

// export const useAccessStatus = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPremium, setIsPremium] = useState(false);
//   const [premiumEndsAt, setPremiumEndsAt] = useState(null);

//   useEffect(() => {
//     const fetchAccess = async () => {
//       try {
//         const token = localStorage.getItem('token'); // если ты сохраняешь JWT
//         const res = await axios.get(`${api}/tg/access-status`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         const data = res.data;
//         setIsPremium(data.isPremium);                
//         setPremiumEndsAt(data.premiumEndsAt);
//       } catch (err) {
//         setAccess(false); // если ошибка — считаем что доступ закрыт
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAccess();
//   }, []);  

//   return { isPremium, premiumEndsAt, isLoading };
// };
import { useEffect, useState } from 'react';
import axios from 'axios';
import api from './api';

export const fetchAccess = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${api}/tg/access-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { isPremium, premiumEndsAt } = res.data;
    localStorage.setItem('isPremium', isPremium ? 'true' : 'false');
    return { isPremium, premiumEndsAt };
  } catch (err) {
    localStorage.setItem('isPremium', 'false');
    return { isPremium: false, premiumEndsAt: null };
  }
};

export const useAccessStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('isPremium') === 'true';
  });
  const [premiumEndsAt, setPremiumEndsAt] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { isPremium, premiumEndsAt } = await fetchAccess();
      setIsPremium(isPremium);
      setPremiumEndsAt(premiumEndsAt);
      setIsLoading(false);
    };

    init();
  }, []);

  return { isPremium, premiumEndsAt, isLoading };
};