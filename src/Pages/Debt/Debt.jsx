import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2Icon, PlusIcon, HandCoinsIcon, TrendingDownIcon, TrendingUpIcon, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import api from '@/Utils/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccessStatus } from '@/Utils/useAccessStatus';

// Constants for display
const DEBTS_PER_PAGE = 50;
const DEBT_STATUS = {
  paid: 'Tolangan',
  unpaid: 'Tolanmagan'
};

const STATUS_COLORS = {
  paid: 'bg-green-500',
  unpaid: 'bg-amber-500'
};

const DEBT_TYPES = {
  given: { text: 'Berilgan qarz', icon: <TrendingDownIcon className="w-4 h-4" />, color: 'text-red-500' },
  taken: { text: 'Olingan qarz', icon: <TrendingUpIcon className="w-4 h-4" />, color: 'text-green-500' }
};

// Helper function for extracting numeric values
const extractNumericValue = (value) => {
  if (typeof value === 'object' && value !== null && value.$numberDecimal !== undefined) {
    return parseFloat(value.$numberDecimal);
  }
  return parseFloat(value || 0);
};

// Memoized debt item component
const DebtItem = React.memo(({ debt, onDelete, hasAccess }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const formatAmount = (amountValue) => {
    const value = extractNumericValue(amountValue);
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleClick = () => {
    navigate(`/debt/${debt._id}`);
  };

  const amount = extractNumericValue(debt.amount);
  const paidAmount = extractNumericValue(debt.paidAmount);
  const remainingAmount = amount - paidAmount;

  return (
    <>
      <div
        className={`flex items-center justify-between bg-white shadow-sm rounded-lg p-3 mb-2 hover:shadow-md transition-shadow duration-200 min-h-[80px] ${!hasAccess ? "opacity-50" : ""}`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${debt.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
            <HandCoinsIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">{debt.person || 'Nomsiz'}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(debt.createdAt).toLocaleDateString()}
            </div>
            <div className="text-xs mt-0.5">
              <Badge className={`${STATUS_COLORS[debt.status]} text-xs py-0 px-1.5`}>
                {DEBT_STATUS[debt.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className={`font-semibold text-sm ${DEBT_TYPES[debt.type].color}`}>
            {formatAmount(debt.amount)} So'm
          </div>

          {paidAmount > 0 && (
            <div className="text-xs text-muted-foreground">
              {`Tolangan: ${formatAmount(debt.paidAmount)} So'm`}
            </div>
          )}

          {remainingAmount > 0 && debt.status !== 'paid' && (
            <div className="text-xs text-amber-600 font-medium">
              {`Qolgan: ${formatAmount(remainingAmount)} So'm`}
            </div>
          )}

          <div className="flex items-center gap-1">
            <div className="text-xs flex items-center gap-1">
              {DEBT_TYPES[debt.type].icon}
              <span className="text-xs">{DEBT_TYPES[debt.type].text}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onDelete?.(debt._id);
          setOpen(false);
        }}
      />
    </>
  );
});

const ConfirmDeleteModal = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Qarzni oʻchirish</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Rostdan ham ushbu qarzni oʻchirmoqchimisiz?
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
};

const DebtView = () => {
  const { isPremium, isLoading: accessLoading } = useAccessStatus();
  const [allDebts, setAllDebts] = useState([]);
  const [displayedDebts, setDisplayedDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [debtStats, setDebtStats] = useState({
    given: 0,
    givenPaid: 0,
    givenRemaining: 0,
    taken: 0,
    takenPaid: 0,
    takenRemaining: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Filter function for debts by status
  const filterDebts = useCallback((debts, status) => {
    if (!debts.length) return [];
    return status === 'all' ? debts : debts.filter(debt => debt.status === status);
  }, []);

  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status);
    const filtered = filterDebts(allDebts, status);
    setDisplayedDebts(filtered);
  }, [allDebts, filterDebts]);

  const formatDebtData = useCallback((rawData) => {
    if (rawData && rawData.debts && Array.isArray(rawData.debts)) {
      return rawData.debts;
    }
    if (Array.isArray(rawData)) {
      return rawData;
    }
    console.warn('Unexpected data format in formatDebtData:', rawData);
    return [];
  }, []);

  const fetchDebtStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`${api}/api/debt/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        const stats = {
          given: extractNumericValue(res.data.totalGiven || 0),
          givenPaid: extractNumericValue(res.data.totalGivenPaid || 0),
          givenRemaining: extractNumericValue(res.data.totalGivenRemaining || 0),
          taken: extractNumericValue(res.data.totalTaken || 0),
          takenPaid: extractNumericValue(res.data.totalTakenPaid || 0),
          takenRemaining: extractNumericValue(res.data.totalTakenRemaining || 0)
        };
        setDebtStats(stats);
      }
    } catch (err) {
      console.error('Error fetching debt statistics:', err);
      if (allDebts.length > 0) {
        calculateStatsFromLoadedDebts();
      }
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setStatsLoading(false);
    }
  }, [navigate, allDebts]);

  const calculateStatsFromLoadedDebts = useCallback(() => {
    const stats = allDebts.reduce((acc, debt) => {
      const amount = extractNumericValue(debt.amount);
      const paidAmount = extractNumericValue(debt.paidAmount);
      if (debt.type === 'given') {
        acc.given += amount;
        acc.givenPaid += Math.min(paidAmount, amount);
        acc.givenRemaining += Math.max(0, amount - paidAmount);
      } else {
        acc.taken += amount;
        acc.takenPaid += Math.min(paidAmount, amount);
        acc.takenRemaining += Math.max(0, amount - paidAmount);
      }
      return acc;
    }, {
      given: 0,
      givenPaid: 0,
      givenRemaining: 0,
      taken: 0,
      takenPaid: 0,
      takenRemaining: 0
    });
    setDebtStats(stats);
  }, [allDebts]);

  const createRequestUrl = useCallback((skipValue) => {
    return `${api}/api/debt?limit=${DEBTS_PER_PAGE}&skip=${skipValue}`;
  }, []);

  const fetchDebts = useCallback(async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
        setPage(0);

        // Check cache
        const cachedRaw = localStorage.getItem("debts");
        const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

        if (cached?.data?.length > 0) {
          setAllDebts(cached.data);
          setDisplayedDebts(filterDebts(cached.data, statusFilter));
          setPage(cached.page || 1);
          setHasMore(cached.hasMore ?? true);
          fetchDebtStats();
          setLoading(false);
          return;
        }
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const skip = initial ? 0 : page * DEBTS_PER_PAGE;
      const url = createRequestUrl(skip);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newData = formatDebtData(res.data);
      
      let updatedDebts;

      if (initial) {
        updatedDebts = newData;
        setPage(1);
      } else {
        updatedDebts = [...allDebts, ...newData];
        setPage(prev => prev + 1);
      }

      const nextPage = initial ? 1 : page + 1;
      const nextHasMore = res.data.hasMore || newData.length === DEBTS_PER_PAGE;

      // Update cache
      localStorage.setItem(
        "debts",
        JSON.stringify({
          data: updatedDebts,
          page: nextPage,
          hasMore: nextHasMore,
        })
      );

      setAllDebts(updatedDebts);
      setDisplayedDebts(filterDebts(updatedDebts, statusFilter));
      setHasMore(nextHasMore);

      if (initial) {
        fetchDebtStats();
      }
    } catch (err) {
      console.error('Error fetching debts:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [allDebts, page, statusFilter, createRequestUrl, formatDebtData, filterDebts, navigate, fetchDebtStats]);

  const handleDeleteDebt = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${api}/api/debt/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("debts");
      await Promise.all([
        fetchDebts(true),
        fetchDebtStats()
      ]);
    } catch (error) {
      console.error('Error deleting debt:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchDebts(false);
    }
  }, [loadingMore, hasMore, fetchDebts]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="pt-4 pb-20 px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Qarzlar</h1>
            <Button
              onClick={() => navigate('/debt/add')}
              className="flex items-center gap-1 py-1 px-2 text-sm"
              size="sm"
              disabled={!isPremium}
            >
              <PlusIcon className="w-4 h-4" />
              Qarz qo'shish
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white p-3 rounded-lg shadow text-sm">
              <div className="text-xs text-muted-foreground">Qolgan:</div>
              <div className="text-base font-bold">
                {statsLoading ? (
                  <span className="inline-flex items-center">
                    <Loader2Icon className="w-3 h-3 mr-1 animate-spin" />
                    Yuklanmoqda
                  </span>
                ) : (
                  `${formatAmount(debtStats.givenRemaining)} So'm`
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="text-xs text-amber-600">
                  <span className="block">Berilgan qarzlar</span>
                  {statsLoading ? '...' : `${formatAmount(debtStats.given)} So'm`}
                </div>
                <div className="text-xs text-green-500">
                  <span className="block">Tolangan:</span>
                  {statsLoading ? '...' : `${formatAmount(debtStats.givenPaid)} So'm`}
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-sm">
              <div className="text-xs text-muted-foreground">Qolgan:</div>
              <div className="text-base font-bold">
                {statsLoading ? (
                  <span className="inline-flex items-center">
                    <Loader2Icon className="w-3 h-3 mr-1 animate-spin" />
                    Yuklanmoqda
                  </span>
                ) : (
                  `${formatAmount(debtStats.takenRemaining)} So'm`
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="text-xs text-amber-600">
                  <span className="block">Olingan qarzlar</span>
                  {statsLoading ? '...' : `${formatAmount(debtStats.taken)} So'm`}
                </div>
                <div className="text-xs text-green-500">
                  <span className="block">Tolangan:</span>
                  {statsLoading ? '...' : `${formatAmount(debtStats.takenPaid)} So'm`}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className={`cursor-pointer px-2 py-1 text-xs font-medium transition-all duration-200 ${statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-secondary hover:shadow-sm border border-gray-200'
                }`}
              onClick={() => handleStatusFilterChange('all')}
            >
              Barcha qarzlar
            </Badge>
            <Badge
              variant={statusFilter === 'unpaid' ? 'default' : 'outline'}
              className={`cursor-pointer px-2 py-1 text-xs font-medium transition-all duration-200 ${statusFilter === 'unpaid'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-secondary hover:shadow-sm border border-gray-200'
                }`}
              onClick={() => handleStatusFilterChange('unpaid')}
            >
              Tolanmagan
            </Badge>
            <Badge
              variant={statusFilter === 'paid' ? 'default' : 'outline'}
              className={`cursor-pointer px-2 py-1 text-xs font-medium transition-all duration-200 ${statusFilter === 'paid'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-secondary hover:shadow-sm border border-gray-200'
                }`}
              onClick={() => handleStatusFilterChange('paid')}
            >
              Tolangan
            </Badge>
          </div>
          
          {!isPremium && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded-lg p-3 my-2">
              <p className="text-sm font-medium">Sizning premium muddatingiz tugagan.</p>
              <p className="text-xs">Qarzlarni o'chirish yoki qo'shish uchun premium hisob oling</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg shadow-sm p-2 max-h-[calc(100vh-260px)] overflow-y-auto">
            {loading || accessLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2Icon className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <>
                {displayedDebts.length > 0 ? (
                  <>
                    {displayedDebts.map((debt) => (
                      <DebtItem
                        key={debt._id}
                        debt={debt}
                        onDelete={handleDeleteDebt}
                        hasAccess={isPremium}
                      />
                    ))}

                    {hasMore && (
                      <div className="mt-4 mb-2">
                        <Button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="w-full py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                              Yuklanmoqda...
                            </>
                          ) : (
                            'Yana yuklash'
                          )}
                        </Button>
                      </div>
                    )}

                    {!hasMore && displayedDebts.length > DEBTS_PER_PAGE && (
                      <p className="text-center text-muted-foreground text-sm mt-4 mb-2">
                        Barcha ma'lumotlar yuklandi
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground text-sm mt-6">
                    Qarzlar topilmadi
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtView;