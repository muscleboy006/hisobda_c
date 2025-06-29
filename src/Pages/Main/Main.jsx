import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
  Loader2Icon,
  PencilIcon
} from "lucide-react";
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
import AddTransaction from './Transaction/AddTransaction';
import EditTransaction from './Transaction/EditTransaction';
import { useAccessStatus } from '@/Utils/useAccessStatus';

const BalanceCard = ({ balance, income, expense, isLoading }) => (
  <Card className="bg-gradient-to-br from-purple-500 to-pink-400 text-white rounded-xl shadow-sm">
    <CardContent className="px-2">
      <h2 className="text-center text-sm font-medium">Hozirgi Balans</h2>
      {isLoading ? (
        <div className="text-center py-4">
          <Loader2Icon className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="text-center text-xl font-bold">{balance} So'm</div>
      )}
      <div className="flex justify-between text-xs font-medium mt-10">
        <div className="flex items-center gap-1">
          <ArrowUpIcon className="h-4 w-4 text-green-200" />
          <span>Kirim:</span>
          {isLoading ? (
            <Loader2Icon className="w-4 h-4 animate-spin text-green-100" />
          ) : (
            <span className="text-green-100">{income} So'm</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ArrowDownIcon className="h-4 w-4 text-red-200" />
          <span>Chiqim:</span>
          {isLoading ? (
            <Loader2Icon className="w-4 h-4 animate-spin text-red-100" />
          ) : (
            <span className="text-red-100">{expense} So'm</span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

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

function TransactionItem({ title, amount, date, icon, color, onDelete, onEdit, hasAccess }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-between bg-white shadow-sm rounded-lg p-3 mb-2 transition-opacity duration-300 ${!hasAccess ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${color} text-white`}>
            {icon}
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">{date}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div className={`font-semibold ${amount < 0 ? "text-red-500" : "text-green-500"}`}>
            {amount < 0 ? `-${Math.abs(amount)} So'm` : `${amount} So'm`}
          </div>
          <PencilIcon
            className={`w-4 h-4 ${hasAccess ? "text-blue-500 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
            onClick={hasAccess ? onEdit : undefined}
          />
          <Trash2Icon
            className={`w-4 h-4 ${hasAccess ? "text-red-500 cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
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
}

const Main = () => {
  const { isPremium, isLoading: accessLoading } = useAccessStatus();
  const periods = ['Bu oy', 'Bugun', 'Bu hafta', 'Bu yil', 'Umumiy'];
  const [activePeriod, setActivePeriod] = useState('Bu oy');
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  const fetchTransactions = async (initial = false, period = activePeriod) => {
    try {
      if (initial) {
        setLoading(true);
        setPage(0);
        setTransactions([]); // Очищаем старые транзакции при начальной загрузке

        // Используем кэш только если период не изменился
        const cachedRaw = localStorage.getItem(`actions_${period}`);
        const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

        if (cached?.data?.length > 0 && cached.period === period) {
          setTransactions(cached.data);
          setPage(cached.page || 1);
          setHasMore(cached.hasMore ?? true);
          setLoading(false);
          return;
        }
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("token");
      if (!token) return navigate('/login');

      const skip = initial ? 0 : page * 50;
      // Исправляем URL - убираем дублирование параметров
      const res = await axios.get(`${api}/api/action?limit=50&skip=${skip}&period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newData = Array.isArray(res.data.transactions)
        ? res.data.transactions.map(t => ({
            amount: parseFloat(t.amount?.$numberDecimal || t.amount),
            category: t.category || "Uncategorized",
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

      // Сохраняем кэш с указанием периода
      localStorage.setItem(`actions_${period}`, JSON.stringify({ 
        data: updatedTransactions, 
        page: nextPage, 
        hasMore: nextHasMore,
        period: period 
      }));

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

  const getSummary = async (period = activePeriod) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${api}/api/action/summary?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIncome(parseFloat(res.data.income) || 0);
      setExpense(parseFloat(res.data.expense) || 0);
    } catch (err) {
      console.error('Summary error:', err);
    }
  };

  const getWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${api}/tg/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const walletData = response.data.wallet?.[0];
      const rawBalance = walletData?.balance?.$numberDecimal || walletData?.balance;
      setBalance(parseFloat(rawBalance) || 0);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
    }
  };

  // Сброс состояния при изменении периода
  useEffect(() => {
    setLoading(true);
    setTransactions([]);
    setPage(0);
    setHasMore(true);

    Promise.all([
      fetchTransactions(true, activePeriod),
      getSummary(activePeriod),
      getWalletBalance()
    ]).catch(console.error);
  }, [activePeriod]);

  const handleDeleteTransaction = async (id) => {    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${api}/api/action/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Очищаем все кэши периодов
      periods.forEach(period => {
        localStorage.removeItem(`actions_${period}`);
      });

      await Promise.all([
        fetchTransactions(true, activePeriod),
        getSummary(activePeriod),
        getWalletBalance(),
      ]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'shopping': return <ShoppingCartIcon className="w-4 h-4" />;
      case 'salary': return <BriefcaseIcon className="w-4 h-4" />;
      case 'gift': return <GiftIcon className="w-4 h-4" />;
      case 'award': return <TrophyIcon className="w-4 h-4" />;
      case 'other': return <TriangleAlertIcon className="w-4 h-4" />;
      default: return <BriefcaseIcon className="w-4 h-4" />;
    }
  };

  const getColorForCategory = (category) => {
    switch (category) {
      case 'shopping': return 'bg-purple-500';
      case 'salary': return 'bg-green-500';
      case 'gift': return 'bg-pink-500';
      case 'award': return 'bg-yellow-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const loadMoreTransactions = () => {
    if (!loadingMore && hasMore) fetchTransactions(false, activePeriod);
  };

  if (activeTab === 'add') {
    return (
      <AddTransaction
        onBack={() => setActiveTab("home")}
        onSuccess={() => {
          setLoading(true);
          // Очищаем все кэши при добавлении новой транзакции
          periods.forEach(period => {
            localStorage.removeItem(`actions_${period}`);
          });
          Promise.all([
            fetchTransactions(true, activePeriod),
            getSummary(activePeriod),
            getWalletBalance()
          ]).finally(() => setLoading(false));
        }}
        balance={balance}
      />
    );
  }

  if (activeTab === 'edit' && selectedTransaction) {
    return (
      <EditTransaction
        transaction={selectedTransaction}
        onBack={() => setActiveTab("home")}
        onSuccess={() => {
          setLoading(true);
          // Очищаем все кэши при редактировании транзакции
          periods.forEach(period => {
            localStorage.removeItem(`actions_${period}`);
          });
          Promise.all([
            fetchTransactions(true, activePeriod),
            getSummary(activePeriod),
            getWalletBalance()
          ]).finally(() => {
            setLoading(false);
            setActiveTab("home");
          });
        }}
        balance={balance}
      />
    );
  }

  return (
    <div className="pt-4 pb-20 flex flex-col h-screen">
      <div className="flex flex-wrap gap-2 mb-4">
        {periods.map(period => (
          <Badge
            key={period}
            variant={activePeriod === period ? 'default' : 'outline'}
            className={`cursor-pointer px-2 py-1 text-xs ${activePeriod === period ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            onClick={() => setActivePeriod(period)}
          >
            {period}
          </Badge>
        ))}
      </div>

      <BalanceCard balance={balance} income={income} expense={expense} isLoading={loading} />
      {!isPremium && !accessLoading && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-3 my-2">
              <p className="text-sm font-medium underline" onClick={() => navigate('/premium')}>Sizning premium muddatingiz tugagan.</p>
              <p className="text-xs">Tranzaksiylarni o'chirish yoki qo'shish uchun premium hisob oling</p>
            </div>
      )}

      <div onClick={() => navigate("/actions")} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg my-4 cursor-pointer">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Tranzaksiyalarni saralash</span>
      </div>

      <div className="flex-1 max-h-[calc(100vh-300px)] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            {transactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                title={transaction.note || transaction.category}
                amount={transaction.type === 'income' ? transaction.amount : -transaction.amount}
                date={new Date(transaction.date).toLocaleDateString()}
                icon={getIconForCategory(transaction.category)}
                color={getColorForCategory(transaction.category)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
                onEdit={() => {
                  setSelectedTransaction(transaction);
                  setActiveTab('edit');
                }}
                hasAccess={isPremium}
              />
            ))}

            {hasMore && (
              <div className="mt-2 mb-4 flex justify-center">
                <Button onClick={loadMoreTransactions} disabled={loadingMore} className="w-full max-w-xs flex items-center justify-center gap-2">
                  {loadingMore ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      Yuklanmoqda...
                    </>
                  ) : "Yana yuklash"}
                </Button>
              </div>
            )}

            {!hasMore && transactions.length > 0 && (
              <p className="text-center text-muted-foreground text-sm mt-2 mb-4">
                Barcha ma'lumotlar yuklandi
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground text-sm mt-4">Tranzaksiyalar topilmadi</p>
        )}
      </div>

      <button 
        onClick={() => setActiveTab('add')} 
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 shadow-lg flex items-center justify-center"
        disabled={!isPremium}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default Main;