import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeftIcon, 
  Loader2Icon, 
  TrendingDownIcon, 
  TrendingUpIcon, 
} from 'lucide-react';
import axios from 'axios';
import api from '@/Utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const AddDebt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const walletId = localStorage.getItem("walletId")
  const [formData, setFormData] = useState({
    walletId: walletId,
    type: 'given',
    amount: '',
    person: '',
    note: '',
  });
  const [errors, setErrors] = useState({});

  // Загрузка кошельков пользователя
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${api}/tg/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.length > 0) {
          setWallets(response.data);
          setFormData(prev => ({ ...prev, walletId: response.data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchWallets();
  }, [navigate]);

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) 
      newErrors.amount = 'Summa musbat raqam bo\'lishi kerak';
    if (!formData.person) newErrors.person = 'Ismni kiriting';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Обработчик изменения select полей
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authorization token not found. Please login again.');
      navigate('/login');
      return;
    }
    
    await axios.post(
      `${api}/api/debt`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    localStorage.removeItem("debts")
    
    console.log('Debt created successfully!');
    navigate('/debts');
  } catch (error) {
    console.error('Error creating debt:', error);
    
    if (error.response?.status === 401) {
      console.error('Session expired. Please login again.');
      navigate('/login');
    } else if (error.response?.data?.error) {
      // Display the specific error message from the API
      console.error(error.response.data.error);
    } else if (!error.response) {
      console.error('Network error. Please check your connection.');
    } else {
      console.error('Failed to create debt. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="pt-6 pb-24 flex flex-col min-h-screen px-4 sm:px-6 md:px-8">
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

      <h1 className="text-2xl font-bold mb-6">Yangi qarz qo'shish</h1>

      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Qarz ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Qarz turi */}
            <div className="space-y-2">
              <Label htmlFor="type">Qarz turi</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Qarz turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="given" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingDownIcon className="w-4 h-4 text-red-500" />
                      <span>Berilgan qarz (Sizdan boshqalarga)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="taken" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-green-500" />
                      <span>Olingan qarz (Boshqalardan sizga)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summa */}
            <div className="space-y-2">
              <Label htmlFor="amount">Summa</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Qarz summasini kiriting"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Shaxs */}
            <div className="space-y-2">
              <Label htmlFor="person">Shaxs</Label>
              <Input
                id="person"
                name="person"
                type="text"
                placeholder="Qarzdor/qarz beruvchi ismi"
                value={formData.person}
                onChange={handleChange}
                className={`w-full ${errors.person ? 'border-red-500' : ''}`}
              />
              {errors.person && <p className="text-sm text-red-500">{errors.person}</p>}
            </div>

            {/* Izoh */}
            <div className="space-y-2">
              <Label htmlFor="note">Izoh</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Ixtiyoriy izoh"
                value={formData.note}
                onChange={handleChange}
                className="w-full"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  <span>Yuklanmoqda...</span>
                </div>
              ) : (
                'Qarzni saqlash'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDebt