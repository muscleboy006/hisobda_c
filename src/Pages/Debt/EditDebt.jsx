import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  TrendingUpIcon 
} from 'lucide-react';
import axios from 'axios';
import api from '@/Utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const EditDebt = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    walletId: '',
    person: '',
    note: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch debt details on mount
  useEffect(() => {
    const fetchDebt = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${api}/api/debt/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Fetched debt data:', response.data); // Debug log

        const debt = response.data.debt; // Extract debt object
        if (debt) {
          setFormData({
            walletId: debt.walletId || '',
            person: debt.person || '',
            note: debt.note || '',
          });
        }
      } catch (error) {
        console.error('Error fetching debt:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 404) {
          console.error('Debt not found');
          navigate('/debts');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchDebt();
  }, [navigate, id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
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

  // Handle form submission
  const handleSubmit = async (e) => {    
    e.preventDefault();

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authorization token not found. Please login again.');
        navigate('/login');
        return;
      }

      await axios.put(
        `${api}/api/debt/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("debts")

      console.log('Debt updated successfully!');
      navigate(`/debt/${id}`);
    } catch (error) {
      console.error('Error updating debt:', error);

      if (error.response?.status === 401) {
        console.error('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        console.error(error.response.data.error);
        setErrors({ api: error.response.data.error });
      } else if (error.response?.status === 404) {
        console.error('Debt or wallet not found');
        navigate('/debts');
      } else if (!error.response) {
        console.error('Network error. Please check your connection.');
      } else {
        console.error('Failed to update debt. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while fetching debt data
  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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

      <h1 className="text-2xl font-bold mb-6">Qarzni tahrirlash</h1>

      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Qarz ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">    
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

            {/* API Error */}
            {errors.api && <p className="text-sm text-red-500">{errors.api}</p>}

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
                'Qarzni yangilash'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDebt;