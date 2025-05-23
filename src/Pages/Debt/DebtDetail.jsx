import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  Loader2Icon, 
  PlusCircleIcon,
  CreditCardIcon,
  TrashIcon,
  PencilIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  Home,
  HandCoins,
  BarChart3
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import api from '@/Utils/api';
import { 
  // fetchAccess, 
  useAccessStatus } from '@/Utils/useAccessStatus';

const DEBT_STATUS = {
  paid: 'Tolangan',
  unpaid: 'Tolanmagan'
};

const STATUS_COLORS = {
  paid: 'bg-green-500',
  unpaid: 'bg-amber-500'
};

const DEBT_TYPES = {
  given: { text: 'Berilgan qarz', icon: <TrendingDownIcon className="w-5 h-5" />, color: 'text-red-500' },
  taken: { text: 'Olingan qarz', icon: <TrendingUpIcon className="w-5 h-5" />, color: 'text-green-500' }
};

const DebtDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPremium, isLoading: accessLoading } = useAccessStatus();
  
  const [loading, setLoading] = useState(true);
  const [debt, setDebt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: ''
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletePaymentConfirmOpen, setIsDeletePaymentConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Форматирование числа
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
    
    // Если это объект с $numberDecimal
    if (typeof amount === 'object' && amount.$numberDecimal) {
      return new Intl.NumberFormat('ru-RU').format(parseFloat(amount.$numberDecimal));
    }
    
    return new Intl.NumberFormat('ru-RU').format(parseFloat(amount) || 0);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Загружаем данные долга и погашений
  const fetchDebtDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${api}/api/debt/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Проверяем структуру ответа и устанавливаем соответствующие данные
      if (response.data.debt) {
        // Если контроллер вернул объект с debt и payments
        setDebt(response.data.debt);
        setPayments(response.data.payments || []);
      } else {
        // Если контроллер вернул только объект долга (старая версия API)
        setDebt(response.data);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching debt details:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtDetails();
  }, [id, navigate]);

  // Обработчик добавления погашения
  const handleAddPayment = async (e) => {
    
    e.preventDefault();
    
    if (!isPremium) return; // Prevent adding payment if no premium access
    
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      alert('Iltimos, toʻlov summasini kiriting');
      return;
    }

    const paymentAmount = parseFloat(newPayment.amount);
    const remaining = getRemainingAmount();

    // Проверяем, не превышает ли сумма платежа остаток долга
    if (paymentAmount > remaining) {
      alert(`Toʻlov summasi qolgan qarz summasidan oshib ketdi. Maksimal summa: ${formatAmount(remaining)} So'm`);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${api}/api/debt-pay/${id}`, {
        amount: paymentAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Обновляем список платежей и долг
      localStorage.removeItem("debts")
      await fetchDebtDetails();

      // Сбрасываем форму и закрываем диалог
      setNewPayment({ amount: '' });
      setIsAddPaymentOpen(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Toʻlov qoʻshishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Открыть диалог подтверждения удаления платежа
  const openDeletePaymentConfirm = async (payment) => {
    
    if (!isPremium) return; // Prevent opening delete dialog if no premium access
    setPaymentToDelete(payment);
    setIsDeletePaymentConfirmOpen(true);
  };

  // Удаление платежа
  const handleDeletePayment = async () => {
    
    if (!isPremium || !paymentToDelete) return; // Prevent deletion if no premium access
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${api}/api/debt-pay/${paymentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Обновляем список платежей и долг
      localStorage.removeItem("debts")
      await fetchDebtDetails();
      setIsDeletePaymentConfirmOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Toʻlovni oʻchirishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Удаление долга
  const handleDeleteDebt = async () => {
    
    if (!isPremium) return; // Prevent deletion if no premium access
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`${api}/api/debt/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("debts");
      navigate('/debts');
    } catch (error) {
      console.error('Error deleting debt:', error);
      alert('Qarzni oʻchirishda xatolik');
    } finally {
      setSubmitting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Расчет оставшейся суммы
  const getRemainingAmount = () => {
    if (!debt) return 0;
    
    let debtAmount = 0;
    let paidAmount = 0;
    
    if (debt.amount) {
      if (debt.amount.$numberDecimal) {
        debtAmount = parseFloat(debt.amount.$numberDecimal);
      } else {
        debtAmount = parseFloat(debt.amount);
      }
    }
    
    if (debt.paidAmount) {
      if (debt.paidAmount.$numberDecimal) {
        paidAmount = parseFloat(debt.paidAmount.$numberDecimal);
      } else {
        paidAmount = parseFloat(debt.paidAmount);
      }
    }
    
    return Math.max(0, debtAmount - paidAmount);
  };

  const navigateToTab = (tab) => {
    if (tab === 'asosiy') {
      navigate('/');
    } else if (tab === 'qarzlar') {
      navigate('/debts');
    } else if (tab === 'hisobot') {
      navigate('/reports');
    }
  };

  if (loading || accessLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-hidden flex justify-center items-center pb-16">
          <Loader2Icon className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        {/* Bottom navigation bar */}
        <div className="grid grid-cols-3 bg-white border-t shadow-md h-[64px] w-full">
          <button
            onClick={() => navigateToTab('asosiy')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors"
          >
            <Home className="w-6 h-6" />
            Asosiy
          </button>
          <button
            onClick={() => navigateToTab('qarzlar')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors text-blue-600"
          >
            <HandCoins className="w-6 h-6" />
            Qarzlar
          </button>
          <button
            onClick={() => navigateToTab('hisobot')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors"
          >
            <BarChart3 className="w-6 h-6" />
            Hisobot
          </button>
        </div>
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="p-4 text-center pb-20">
            <p className="text-red-500">Qarz topilmadi.</p>
            <Button onClick={() => navigate('/debts')} className="mt-4">
              Orqaga
            </Button>
          </div>
        </div>
        
        {/* Bottom navigation bar */}
        <div className="grid grid-cols-3 bg-white border-t shadow-md h-[64px] w-full">
          <button
            onClick={() => navigateToTab('asosiy')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors"
          >
            <Home className="w-6 h-6" />
            Asosiy
          </button>
          <button
            onClick={() => navigateToTab('qarzlar')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors text-blue-600"
          >
            <HandCoins className="w-6 h-6" />
            Qarzlar
          </button>
          <button
            onClick={() => navigateToTab('hisobot')}
            className="flex flex-col items-center justify-center text-sm w-full text-center transition-colors"
          >
            <BarChart3 className="w-6 h-6" />
            Hisobot
          </button>
        </div>
      </div>
    );
  }

  const remainingAmount = getRemainingAmount();
  const isFullyPaid = debt.status === 'paid';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="pt-4 pb-24 flex flex-col px-3 sm:px-4 md:px-6">
          <div className="mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/debts')}
              className="flex items-center gap-1 text-sm p-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Orqaga
            </Button>
          </div>

          {!isPremium && !accessLoading && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-3 mb-4">
              <p 
              className="text-sm font-medium underline" 
              onClick={() => navigate('/premium')}
              >Sizning premium muddatingiz tugagan.</p>
              <p className="text-xs">Qarzlarni o'chirish yoki qo'shish uchun premium hisob oling</p>
            </div>
          )}

          {/* Основная информация о долге */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold mb-1 flex items-center gap-2">
                  {DEBT_TYPES[debt.type].icon}
                  <span>{debt.person || 'Nomsiz'}</span>
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={STATUS_COLORS[debt.status]}>
                    {DEBT_STATUS[debt.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(debt.createdAt)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {debt.note}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isPremium ? navigate(`/debt/edit/${id}`) : undefined}
                  className={`flex items-center gap-1 ${!isPremium ? "text-gray-300 cursor-not-allowed" : ""}`}
                  disabled={!isPremium}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => isPremium ? setIsDeleteConfirmOpen(true) : undefined}
                  className={`flex items-center gap-1 ${!isPremium ? "bg-gray-300 cursor-not-allowed hover:bg-gray-300" : ""}`}
                  disabled={!isPremium}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Суммы */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Umumiy summa</div>
                <div className={`text-lg font-bold ${DEBT_TYPES[debt.type].color}`}>
                  {formatAmount(debt.amount)} So'm
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Tolangan</div>
                <div className="text-lg font-bold text-green-500">
                  {formatAmount(debt.paidAmount)} So'm
                </div>
              </div>
              
              {!isFullyPaid && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Qolgan summa</div>
                  <div className="text-lg font-bold text-amber-600">
                    {formatAmount(remainingAmount)} So'm
                  </div>
                </div>
              )}
              
              {isFullyPaid && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Tolangan sana</div>
                  <div className="text-base font-medium text-green-600">
                    {formatDate(debt.paidAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Список платежей */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Toʻlovlar tarixi</h2>
            {!isFullyPaid && (
              <Button 
                onClick={() => isPremium ? setIsAddPaymentOpen(true) : undefined}
                className={`flex items-center gap-1 py-1 px-2 text-sm ${!isPremium ? "bg-gray-300 cursor-not-allowed hover:bg-gray-300" : ""}`}
                size="sm"
                disabled={!isPremium}
              >
                <PlusCircleIcon className="w-4 h-4" />
                Toʻlov qoʻshish
              </Button>
            )}
          </div>

          <div className="flex-1 bg-gray-50 rounded-lg shadow-sm p-2 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[450px]">
              {payments && payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment._id} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full p-2 bg-blue-500 text-white">
                            <CreditCardIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {formatAmount(payment.amount)} So'm
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(payment.paidAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => isPremium ? openDeletePaymentConfirm(payment) : undefined}
                            className={`h-6 w-6 rounded-full ${!isPremium ? "text-gray-300 cursor-not-allowed" : ""}`}
                            disabled={!isPremium}
                          >
                            <TrashIcon className={`w-4 h-4 ${isPremium ? "text-red-500" : "text-gray-300"}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm mt-6">
                  Toʻlovlar tarixi yoʻq
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Диалог добавления частичного погашения */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toʻlov qoʻshish</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Toʻlov summasi</label>
              <Input
                type="number"
                placeholder="Toʻlov summasini kiriting"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                required
                min="1"
                max={remainingAmount}
                step="any"
                className="w-full"
                disabled={!isPremium}
              />
              {remainingAmount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Qolgan summa: {formatAmount(remainingAmount)} So'm
                  <span className="ml-1 text-blue-500">(maksimal toʻlov summasi)</span>
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddPaymentOpen(false)}
                disabled={submitting}
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !isPremium || !newPayment.amount || (parseFloat(newPayment.amount) > remainingAmount)}
              >
                {submitting ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  'Saqlash'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления долга */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qarzni oʻchirish</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rostdan ham ushbu qarzni barcha toʻlovlari bilan birga oʻchirmoqchimisiz?
          </p>
          <DialogFooter className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={submitting}
            >
              Bekor qilish
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteDebt}
              disabled={submitting || !isPremium}
            >
              {submitting ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Oʻchirilmoqda...
                </>
              ) : (
                'Ha, oʻchirish'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления платежа */}
      <Dialog open={isDeletePaymentConfirmOpen} onOpenChange={setIsDeletePaymentConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toʻlovni oʻchirish</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Rostdan ham ushbu {paymentToDelete ? formatAmount(paymentToDelete.amount) : ''} So'm miqdoridagi toʻlovni oʻchirmoqchimisiz?
          </p>
          <DialogFooter className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsDeletePaymentConfirmOpen(false);
                setPaymentToDelete(null);
              }}
              disabled={submitting}
            >
              Bekor qilish
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePayment}
              disabled={submitting || !isPremium}
            >
              {submitting ? (
                <>
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  Oʻchirilmoqda...
                </>
              ) : (
                'Ha, oʻchirish'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtDetailView;