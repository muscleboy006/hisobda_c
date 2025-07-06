// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import { Badge } from "@/components/ui/badge";
// import { Button } from '@/components/ui/button';
// import { ShoppingCartIcon, Trash2Icon, ArrowLeftIcon, Loader2Icon, FilterIcon } from "lucide-react";
// import {
//   BriefcaseIcon,
//   GiftIcon,
//   TrophyIcon,
//   TriangleAlertIcon,
// } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import api from '@/Utils/api';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useAccessStatus } from '@/Utils/useAccessStatus';

// // Константы
// const TRANSACTIONS_PER_PAGE = 50;
// const CATEGORY_ICONS = {
//   shopping: <ShoppingCartIcon className="w-5 h-5" />,
//   salary: <BriefcaseIcon className="w-5 h-5" />,
//   gift: <GiftIcon className="w-5 h-5" />,
//   award: <TrophyIcon className="w-5 h-5" />,
//   other: <TriangleAlertIcon className="w-5 h-5" />,
//   default: <BriefcaseIcon className="w-5 h-5" />
// };

// const CATEGORY_COLORS = {
//   salary: 'bg-green-500',
//   gift: 'bg-pink-500',
//   shopping: 'bg-purple-500',
//   award: 'bg-yellow-500',
//   other: 'bg-gray-500',
// };

// const UZBEK_CATEGORY_NAMES = {
//   salary: 'Maosh',
//   gift: "Hadiya",
//   award: 'Mukofot',
//   shopping: 'Xarid',
//   other: 'Boshqa'
// };

// const PERIODS = ['Bu oy', 'Bugun', 'Bu hafta', 'Bu yil', 'Umumiy'];

// // Мемоизированный компонент TransactionItem
// const TransactionItem = React.memo(({ title, amount, date, icon, color, onDelete, hasAccess }) => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <div className={`flex items-center justify-between bg-white shadow-sm rounded-lg p-4 mb-3 hover:shadow-md transition-shadow duration-200 min-h-[100px] ${!hasAccess ? "opacity-50" : ""}`}>
//         <div className="flex items-center gap-3">
//           <div className={`rounded-full p-2.5 ${color} text-white`}>{icon}</div>
//           <div>
//             <div className="font-semibold text-base">{title}</div>
//             <div className="text-xs text-muted-foreground">{date}</div>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 text-right">
//           <div className={`font-semibold text-base ${amount < 0 ? "text-red-500" : "text-green-500"}`}>
//             {amount < 0 ? `-${Math.abs(amount)} So'm` : `${amount} So'm`}
//           </div>
//           <Trash2Icon
//             className={`w-5 h-5 ${hasAccess ? "text-red-500 cursor-pointer hover:text-red-600 transition-colors duration-200" : "text-gray-300 cursor-not-allowed"}`}
//             onClick={hasAccess ? () => setOpen(true) : undefined}
//           />
//         </div>
//       </div>
//       <ConfirmDeleteModal open={open} onClose={() => setOpen(false)} onConfirm={() => { onDelete?.(); setOpen(false); }} />
//     </>
//   );
// });

// const ConfirmDeleteModal = ({ open, onClose, onConfirm }) => {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Tranzaksiyani oʻchirish</DialogTitle>
//         </DialogHeader>
//         <p className="text-sm text-muted-foreground">Rostdan ham ushbu tranzaksiyani oʻchirmoqchimisiz?</p>
//         <DialogFooter className="mt-4">
//           <Button variant="ghost" onClick={onClose}>Bekor qilish</Button>
//           <Button variant="destructive" onClick={onConfirm}>Ha, oʻchirish</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// const TransactionView = () => {
//   const { isPremium, isLoading: accessLoading } = useAccessStatus();
//   const [activePeriod, setActivePeriod] = useState('Bu oy');
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [allTransactions, setAllTransactions] = useState([]);
//   const [displayedTransactions, setDisplayedTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
//   const navigate = useNavigate();

//   // Мемоизированные категории
//   const availableCategories = useMemo(() => [
//     { id: 'all', name: 'Barchasi' },
//     ...Object.keys(UZBEK_CATEGORY_NAMES).map(key => ({
//       id: key,
//       name: UZBEK_CATEGORY_NAMES[key],
//       icon: CATEGORY_ICONS[key],
//       color: CATEGORY_COLORS[key]
//     }))
//   ], []);

//   const getPeriodFilter = useCallback((period) => {
//     const now = new Date();
//     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
//     switch (period) {
//       case 'Bugun': {
//         const endOfDay = new Date(startOfDay);
//         endOfDay.setHours(23, 59, 59, 999);
//         return { start: startOfDay, end: endOfDay };
//       }
//       case 'Bu hafta': {
//         const start = new Date(startOfDay);
//         const dayOfWeek = startOfDay.getDay();
//         const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//         start.setDate(startOfDay.getDate() - daysToMonday);
//         const end = new Date(now);
//         end.setHours(23, 59, 59, 999);
//         return { start, end };
//       }
//       case 'Bu oy': {
//         const start = new Date(now.getFullYear(), now.getMonth(), 1);
//         const end = new Date(now);
//         end.setHours(23, 59, 59, 999);
//         return { start, end };
//       }
//       case 'Bu yil': {
//         const start = new Date(now.getFullYear(), 0, 1);
//         const end = new Date(now);
//         end.setHours(23, 59, 59, 999);
//         return { start, end };
//       }
//       default: return {};
//     }
//   }, []);

//   const filterTransactions = useCallback((transactions, category) => {
//     if (!transactions.length) return [];
//     return category === 'all' ? transactions : transactions.filter(transaction => transaction.category === category);
//   }, []);

//   const formatTransactionData = useCallback((rawData) => {
//     return Array.isArray(rawData) ? rawData.map(transaction => ({
//       amount: transaction.amount?.$numberDecimal ? parseFloat(transaction.amount.$numberDecimal) : parseFloat(transaction.amount),
//       category: transaction.category || "other",
//       date: transaction.date,
//       note: transaction.note || "",
//       type: transaction.type,
//       userId: transaction.userId,
//       walletId: transaction.walletId,
//       id: transaction._id,
//     })) : [];
//   }, []);

//   const createRequestUrl = useCallback((period, skipValue) => {
//     let url = `${api}/api/action?limit=${TRANSACTIONS_PER_PAGE}&skip=${skipValue}`;
//     if (period !== 'Umumiy') {
//       const periodFilter = getPeriodFilter(period);
//       if (periodFilter.start && periodFilter.end) {
//         url += `&startDate=${encodeURIComponent(periodFilter.start.toISOString())}&endDate=${encodeURIComponent(periodFilter.end.toISOString())}`;
//       }
//     }
//     return url;
//   }, [getPeriodFilter]);

//   const fetchTransactions = useCallback(async (initial = false, period = activePeriod) => {
//     try {
//       if (initial) {
//         setLoading(true);
//         setPage(0);
//       } else {
//         setLoadingMore(true);
//       }

//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const skip = initial ? 0 : page * TRANSACTIONS_PER_PAGE;
//       const url = createRequestUrl(period, skip);
//       const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

//       const newData = formatTransactionData(res.data.transactions);
//       const nextHasMore = newData.length === TRANSACTIONS_PER_PAGE;

//       setAllTransactions((prev) => {
//         const updatedTransactions = initial ? newData : [...prev, ...newData];
//         const filteredTransactions = filterTransactions(updatedTransactions, activeCategory);
//         setDisplayedTransactions(filteredTransactions);
//         return updatedTransactions;
//       });

//       setPage(initial ? 1 : page + 1);
//       setHasMore(nextHasMore);
//     } catch (err) {
//       console.error('Error fetching transactions:', err);
//       if (err.response?.status === 401) navigate('/login');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   }, [page, activeCategory, createRequestUrl, formatTransactionData, filterTransactions, navigate, activePeriod]);

//   const handlePeriodChange = useCallback((period) => {
//     if (period === activePeriod) return;
    
//     setActivePeriod(period);
//     setPage(0);
//     setHasMore(true);
//     setAllTransactions([]);
//     setDisplayedTransactions([]);
    
//     fetchTransactions(true, period);
//   }, [fetchTransactions, activePeriod]);

//   const handleCategoryChange = useCallback((category) => {
//     if (category === activeCategory) {
//       setCategoryFilterOpen(false);
//       return;
//     }
    
//     setActiveCategory(category);
//     setCategoryFilterOpen(false);
//     const filtered = filterTransactions(allTransactions, category);
//     setDisplayedTransactions(filtered);
//   }, [allTransactions, filterTransactions, activeCategory]);

//   const handleDeleteTransaction = useCallback(async (id) => {    
//     if (!isPremium) return; // Prevent deletion if not premium
    
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       await axios.delete(`${api}/api/action/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      
//       // Перезагружаем данные после удаления
//       setPage(0);
//       setHasMore(true);
//       setAllTransactions([]);
//       setDisplayedTransactions([]);
//       await fetchTransactions(true, activePeriod);
//     } catch (error) {
//       console.error('Error deleting transaction:', error);
//       if (error.response?.status === 401) navigate('/login');
//     } finally {
//       setLoading(false);
//     }
//   }, [isPremium, activePeriod, fetchTransactions, navigate]);

//   const loadMore = useCallback(() => {
//     if (!loadingMore && hasMore) fetchTransactions(false, activePeriod);
//   }, [loadingMore, hasMore, fetchTransactions, activePeriod]);

//   useEffect(() => {
//     fetchTransactions(true, activePeriod);
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) navigate('/login');
//   }, [navigate]);

//   const getIconForCategory = useCallback((category) => CATEGORY_ICONS[category] || CATEGORY_ICONS.default, []);
//   const getColorForCategory = useCallback((category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.default, []);
//   const getUzbekCategoryName = useCallback((category) => UZBEK_CATEGORY_NAMES[category] || UZBEK_CATEGORY_NAMES.default, []);

//   const CategoryFilterDialog = () => (
//     <Dialog open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Kategoriya bo'yicha filtrlash</DialogTitle>
//         </DialogHeader>
//         <div className="grid grid-cols-1 gap-3 mt-4">
//           {availableCategories.map((cat) => (
//             <Button
//               key={cat.id}
//               variant={activeCategory === cat.id ? "default" : "outline"}
//               className="flex items-center justify-between py-3 px-4 w-full"
//               onClick={() => handleCategoryChange(cat.id)}
//             >
//               <div className="flex items-center gap-3">
//                 {cat.id !== 'all' && (
//                   <div className={`rounded-full p-2 ${cat.color} text-white`}>{cat.icon}</div>
//                 )}
//                 <span>{cat.name}</span>
//               </div>
//               {activeCategory === cat.id && (
//                 <div className="w-4 h-4 bg-primary rounded-full"></div>
//               )}
//             </Button>
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );

//   const currentCategoryInfo = useMemo(() => {
//     if (activeCategory === 'all') return { name: 'Barchasi', icon: null, color: null };
//     return {
//       name: UZBEK_CATEGORY_NAMES[activeCategory],
//       icon: CATEGORY_ICONS[activeCategory],
//       color: CATEGORY_COLORS[activeCategory]
//     };
//   }, [activeCategory]);

//   return (
//     <div className="pt-6 pb-24 flex flex-col min-h-screen px-4 sm:px-6 md:px-8">
//       <div className="mb-6">
//         <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm">
//           <ArrowLeftIcon className="w-5 h-5" /> Orqaga
//         </Button>
//       </div>
      
//       {!isPremium && !accessLoading && (
//         <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-3 mb-6">
//             <p className="text-sm font-medium underline" onClick={() => navigate('/premium')}>Sizning premium muddatingiz tugagan.</p>
//             <p className="text-xs">Tranzaksiylarni o'chirish yoki qo'shish uchun premium hisob oling</p>
//         </div>
//       )}

//       <div className="flex flex-wrap gap-3 mb-6">
//         {PERIODS.map((period) => (
//           <Badge
//             key={period}
//             variant={activePeriod === period ? 'default' : 'outline'}
//             className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
//               activePeriod === period ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-secondary hover:shadow-sm border border-gray-200'
//             }`}
//             onClick={() => handlePeriodChange(period)}
//           >
//             {period}
//           </Badge>
//         ))}
//       </div>

//       <div className="flex flex-col gap-3 mb-6">
//         <Button
//           variant="outline"
//           className="flex items-center justify-between w-full py-3 px-4 border rounded-lg shadow-sm hover:bg-secondary transition-all duration-200"
//           onClick={() => setCategoryFilterOpen(true)}
//         >
//           <div className="flex items-center gap-3">
//             <FilterIcon className="w-5 h-5 text-muted-foreground" />
//             <div className="flex items-center gap-2">
//               <span>Kategoriya:</span>
//               <div className="flex items-center gap-2">
//                 {activeCategory !== 'all' && currentCategoryInfo.icon && (
//                   <div className={`rounded-full p-1.5 ${currentCategoryInfo.color} text-white`}>
//                     {React.cloneElement(currentCategoryInfo.icon, { className: "w-3 h-3" })}
//                   </div>
//                 )}
//                 <span className="font-medium">{currentCategoryInfo.name}</span>
//               </div>
//             </div>
//           </div>
//         </Button>
//       </div>

//       <div className="flex-1 bg-gray-50 rounded-lg shadow-sm p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
//         {loading || accessLoading ? (
//           <div className="flex justify-center items-center h-32">
//             <Loader2Icon className="w-8 h-8 text-primary animate-spin" />
//           </div>
//         ) : (
//           <>
//             {displayedTransactions.length > 0 ? (
//               <>
//                 {displayedTransactions.map((transaction) => (
//                   <TransactionItem
//                     key={transaction.id}
//                     title={transaction.note || getUzbekCategoryName(transaction.category)}
//                     amount={transaction.type === 'income' ? transaction.amount : -transaction.amount}
//                     date={new Date(transaction.date).toLocaleDateString()}
//                     icon={getIconForCategory(transaction.category)}
//                     color={getColorForCategory(transaction.category)}
//                     onDelete={() => handleDeleteTransaction(transaction.id)}
//                     hasAccess={isPremium}
//                   />
//                 ))}
//                 {hasMore && !loadingMore && displayedTransactions.length >= TRANSACTIONS_PER_PAGE && (
//                   <div className="mt-4 mb-2">
//                     <Button
//                       onClick={loadMore}
//                       className="w-full py-3 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2"
//                     >
//                       Yana yuklash
//                     </Button>
//                   </div>
//                 )}
//                 {loadingMore && (
//                   <div className="flex justify-center items-center py-4">
//                     <Loader2Icon className="w-6 h-6 text-primary animate-spin" />
//                   </div>
//                 )}
//                 {!hasMore && displayedTransactions.length > 0 && (
//                   <p className="text-center text-muted-foreground text-sm mt-4 mb-2">
//                     Barcha ma'lumotlar yuklandi
//                   </p>
//                 )}
//               </>
//             ) : (
//               <p className="text-center text-muted-foreground text-sm mt-6">
//                 Tranzaksiyalar topilmadi
//               </p>
//             )}
//           </>
//         )}
//       </div>
//       <CategoryFilterDialog />
//     </div>
//   );
// };

// export default TransactionView;
import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, Trash2Icon, ArrowLeftIcon, Loader2Icon, FilterIcon } from "lucide-react";
import {
  BriefcaseIcon,
  GiftIcon,
  TrophyIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import api from '@/Utils/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccessStatus } from '@/Utils/useAccessStatus';

// Компонент для отображения одной транзакции
const TransactionItem = React.memo(({ title, amount, date, icon, color, onDelete, hasAccess }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-between bg-white shadow-sm rounded-lg p-4 mb-3 hover:shadow-md transition-shadow duration-200 ${!hasAccess ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2.5 ${color} text-white`}>{icon}</div>
          <div>
            <div className="font-semibold text-base">{title}</div>
            <div className="text-xs text-muted-foreground">{date}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div className={`font-semibold text-base ${amount < 0 ? "text-red-500" : "text-green-500"}`}>
            {amount < 0 ? `-${Math.abs(amount)} So'm` : `${amount} So'm`}
          </div>
          <Trash2Icon
            className={`w-5 h-5 ${hasAccess ? "text-red-500 cursor-pointer hover:text-red-600 transition-colors duration-200" : "text-gray-300 cursor-not-allowed"}`}
            onClick={hasAccess ? () => setOpen(true) : undefined}
          />
        </div>
      </div>
      <ConfirmDeleteModal 
        open={open} 
        onClose={() => setOpen(false)} 
        onConfirm={() => { 
          onDelete?.(); 
          setOpen(false); 
        }} 
      />
    </>
  );
});

// Модальное окно подтверждения удаления
function ConfirmDeleteModal({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tranzaksiyani oʻchirish</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Rostdan ham ushbu tranzaksiyani oʻchirmoqchimisiz?
        </p>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Ha, oʻchirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Модальное окно для фильтрации по категориям
const CategoryFilterDialog = ({ open, onClose, categories, activeCategory, onCategoryChange }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Kategoriya bo'yicha filtrlash</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-3 mt-4">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            className="flex items-center justify-between py-3 px-4 w-full"
            onClick={() => onCategoryChange(cat.id)}
          >
            <div className="flex items-center gap-3">
              {cat.id !== 'all' && cat.icon && (
                <div className={`rounded-full p-2 ${cat.color} text-white`}>{cat.icon}</div>
              )}
              <span>{cat.name}</span>
            </div>
            {activeCategory === cat.id && (
              <div className="w-4 h-4 bg-primary rounded-full"></div>
            )}
          </Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

const TransactionView = () => {
  const { isPremium, isLoading: accessLoading } = useAccessStatus();
  const navigate = useNavigate();
  
  // Периоды и категории
  const periods = ['Bu oy', 'Bugun', 'Bu hafta', 'Bu yil', 'Umumiy'];
  const categories = [
    { id: 'all', name: 'Barchasi' },
    { id: 'shopping', name: 'Xarid', icon: <ShoppingCartIcon className="w-5 h-5" />, color: 'bg-purple-500' },
    { id: 'salary', name: 'Maosh', icon: <BriefcaseIcon className="w-5 h-5" />, color: 'bg-green-500' },
    { id: 'gift', name: 'Hadiya', icon: <GiftIcon className="w-5 h-5" />, color: 'bg-pink-500' },
    { id: 'award', name: 'Mukofot', icon: <TrophyIcon className="w-5 h-5" />, color: 'bg-yellow-500' },
    { id: 'other', name: 'Boshqa', icon: <TriangleAlertIcon className="w-5 h-5" />, color: 'bg-gray-500' }
  ];

  // Состояние компонента
  const [activePeriod, setActivePeriod] = useState('Bu oy');
  const [activeCategory, setActiveCategory] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);

  // Основная функция загрузки транзакций (как в Main.jsx)
  const fetchTransactions = async (initial = false, period = activePeriod, category = activeCategory) => {
    try {
      if (initial) {
        setLoading(true);
        setPage(0);
        setTransactions([]);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("token");
      if (!token) return navigate('/login');

      const skip = initial ? 0 : page * 50;
      let url = `${api}/api/action?limit=50&skip=${skip}&period=${period}`;
      
      // Добавляем параметр категории, если она не "all"
      if (category !== 'all') {
        url += `&category=${category}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newData = Array.isArray(res.data.transactions)
        ? res.data.transactions.map(t => ({
            amount: parseFloat(t.amount?.$numberDecimal || t.amount),
            category: t.category || "other",
            date: t.date,
            note: t.note || "",
            type: t.type,
            userId: t.userId,
            walletId: t.walletId,
            id: t._id,
          }))
        : [];

      const updatedTransactions = initial ? newData : [...transactions, ...newData];
      const nextPage = initial ? 1 : page + 1;
      const nextHasMore = newData.length === 50;

      setTransactions(updatedTransactions);
      setPage(nextPage);
      setHasMore(nextHasMore);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Обработчики событий
  const handlePeriodChange = (period) => {
    if (period === activePeriod) return;
    setActivePeriod(period);
    fetchTransactions(true, period, activeCategory);
  };

  const handleCategoryChange = (category) => {
    if (category === activeCategory) {
      setCategoryFilterOpen(false);
      return;
    }
    setActiveCategory(category);
    setCategoryFilterOpen(false);
    fetchTransactions(true, activePeriod, category);
  };

  const handleDeleteTransaction = async (id) => {
    if (!isPremium) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${api}/api/action/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Перезагружаем данные после удаления
      await fetchTransactions(true, activePeriod, activeCategory);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(false, activePeriod, activeCategory);
    }
  };

  // Вспомогательные функции для получения иконок и цветов
  const getIconForCategory = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || <BriefcaseIcon className="w-5 h-5" />;
  };

  const getColorForCategory = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.color || 'bg-blue-500';
  };

  const getCategoryName = (category) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.name || 'Boshqa';
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransactions(true, activePeriod, activeCategory);
  }, []);

  const currentCategoryInfo = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="pt-6 pb-24 flex flex-col min-h-screen px-4 sm:px-6 md:px-8">
      {/* Кнопка "Назад" */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="w-5 h-5" /> 
          Orqaga
        </Button>
      </div>
      
      {/* Уведомление о премиуме */}
      {!isPremium && !accessLoading && (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-3 mb-6">
          <p className="text-sm font-medium underline cursor-pointer" onClick={() => navigate('/premium')}>
            Sizning premium muddatingiz tugagan.
          </p>
          <p className="text-xs">
            Tranzaksiylarni o'chirish yoki qo'shish uchun premium hisob oling
          </p>
        </div>
      )}

      {/* Фильтры по периодам */}
      <div className="flex flex-wrap gap-3 mb-6">
        {periods.map((period) => (
          <Badge
            key={period}
            variant={activePeriod === period ? 'default' : 'outline'}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activePeriod === period 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'hover:bg-secondary hover:shadow-sm border border-gray-200'
            }`}
            onClick={() => handlePeriodChange(period)}
          >
            {period}
          </Badge>
        ))}
      </div>

      {/* Фильтр по категориям */}
      <div className="flex flex-col gap-3 mb-6">
        <Button
          variant="outline"
          className="flex items-center justify-between w-full py-3 px-4 border rounded-lg shadow-sm hover:bg-secondary transition-all duration-200"
          onClick={() => setCategoryFilterOpen(true)}
        >
          <div className="flex items-center gap-3">
            <FilterIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span>Kategoriya:</span>
              <div className="flex items-center gap-2">
                {activeCategory !== 'all' && currentCategoryInfo?.icon && (
                  <div className={`rounded-full p-1.5 ${currentCategoryInfo.color} text-white`}>
                    {React.cloneElement(currentCategoryInfo.icon, { className: "w-3 h-3" })}
                  </div>
                )}
                <span className="font-medium">{currentCategoryInfo?.name}</span>
              </div>
            </div>
          </div>
        </Button>
      </div>

      {/* Список транзакций */}
      <div className="flex-1 bg-gray-50 rounded-lg shadow-sm p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {loading || accessLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2Icon className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                title={transaction.note || getCategoryName(transaction.category)}
                amount={transaction.type === 'income' ? transaction.amount : -transaction.amount}
                date={new Date(transaction.date).toLocaleDateString()}
                icon={getIconForCategory(transaction.category)}
                color={getColorForCategory(transaction.category)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
                hasAccess={isPremium}
              />
            ))}

            {/* Кнопка "Загрузить еще" */}
            {hasMore && (
              <div className="mt-4 mb-2 flex justify-center">
                <Button
                  onClick={loadMoreTransactions}
                  disabled={loadingMore}
                  className="w-full max-w-xs flex items-center justify-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    "Yana yuklash"
                  )}
                </Button>
              </div>
            )}

            {/* Сообщение о том, что все данные загружены */}
            {!hasMore && transactions.length > 0 && (
              <p className="text-center text-muted-foreground text-sm mt-4 mb-2">
                Barcha ma'lumotlar yuklandi
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground text-sm mt-6">
            Tranzaksiyalar topilmadi
          </p>
        )}
      </div>

      {/* Модальное окно для фильтрации категорий */}
      <CategoryFilterDialog
        open={categoryFilterOpen}
        onClose={() => setCategoryFilterOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
};

export default TransactionView;