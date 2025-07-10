import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useAccessStatus } from './useAccessStatus';

// Импорт компонентов shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, loading, logout } = useAuth();
  const { access, premiumEndsAt, isLoading: accessLoading } = useAccessStatus();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  console.log(premiumEndsAt);

  // Перенаправляем неавторизованных пользователей
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  if (loading || accessLoading) {
    return (
      <div className="flex gap-2 min-h-screen justify-center bg-gray-100 p-4">
        <div className="flex flex-col gap-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-50 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-2 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-50 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-2 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        </Card>
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-between py-2 px-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-50 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-2 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }  

  if (!currentUser) {
    return null; // Будет перенаправлено в useEffect
  }

  // Получаем инициалы пользователя для фоллбэка аватара
  const getInitials = () => {
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`;
    } else if (currentUser.username) {
      return currentUser.username[0].toUpperCase();
    }
    return 'U';
  };

  // Кастомный форматтер даты и времени для узбекского языка
  const formatPremiumEndDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return null;

    const uzbekMonths = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'
    ];

    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = uzbekMonths[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${day}-chi ${month}, soat ${hours}:${minutes}`;
  };

  // Проверяем, закончился ли пробный период
  const isPremiumEnded = premiumEndsAt && new Date(premiumEndsAt) < new Date();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUser.id.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // Скрыть через 1.5 сек
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white p-4">
      {/* Карточка профиля */}
      <Card className="w-full max-w-md mb-4">
        <CardContent className="flex items-center justify-between py-2 px-3">
          {/* Левая часть: аватар и данные */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {currentUser.photo_url ? (
                <AvatarImage src={currentUser.photo_url} alt="Аватар" />
              ) : null}
              <AvatarFallback className="text-xs font-bold bg-blue-100 text-blue-700">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col text-left">
              <h3 className="text-sm font-medium leading-tight">
                {currentUser.first_name} {currentUser.last_name}
              </h3>
              {currentUser.username && (
                <p className="text-gray-600 text-xs leading-tight">@{currentUser.username}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <p className="text-gray-500 text-xs leading-tight">ID: {currentUser.id}</p>
                <button
                  onClick={handleCopy}
                  className="text-blue-700 hover:underline text-xs flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" />
                      <span>Ko‘chirildi</span>
                    </>
                  ) : (
                    "Ko‘chirish"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Правая часть: меню */}
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menyu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600">Chiqish</DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hisobdan chiqish</AlertDialogTitle>
                <AlertDialogDescription>
                  Siz rostdan ham o'z hisobingizdan chiqmoqchimisiz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction onClick={logout}>Chiqish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md mb-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                ⭐ Premium obuna
              </span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                TOP
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Cheksiz imkoniyatlar
                </p>
                {/* <div className="text-right">
                  <div className="text-lg font-bold text-blue-700">36 000</div>
                  <div className="text-xs text-gray-500 -mt-1">so'm/oy</div>
                </div> */}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-green-600">✓</span>
                <span>Barcha funksiyalar</span>
              </div>
              
              <Button 
                onClick={() => navigate('/premium')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm h-9 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                size="sm"
              >
                💳 Sotib olish
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Информация о пробном периоде */}
      {!access && premiumEndsAt && formatPremiumEndDate(premiumEndsAt) && (
        <Card className="w-full max-w-md mb-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Premium muddat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={isPremiumEnded ? "text-sm text-red-600" : "text-sm text-gray-600"}>
              {isPremiumEnded
                ? `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugagan`
                : `Sizning premium muddatingiz ${formatPremiumEndDate(premiumEndsAt)} da tugaydi`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Место для дополнительных элементов */}
      <div className="w-full max-w-md space-y-2">
        {/* Здесь вы можете добавить дополнительные карточки или компоненты */}
        <Card className="w-full max-w-md mb-1">
        <CardHeader>
            <CardTitle className="text-sm font-medium">Ilova haqida</CardTitle>
          </CardHeader>
          <CardContent>
              Savol va takliflaringiz bolsa yozishingiz mumkun. <br />
              Telegram: <a href="https://t.me/hisobda_app" className='underline text-blue-500'>@hisobda_app</a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;