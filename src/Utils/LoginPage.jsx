import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import TelegramLoginButton from './TelegramLoginButton';

// Импорт компонентов shadcn/ui
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPage = () => {
  const { currentUser, loading, error } = useAuth();
  const navigate = useNavigate();
  
  // Перенаправляем пользователя, если он уже авторизован
  useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-10 w-40 rounded-lg" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Tizimga kirish</CardTitle>
          <CardDescription className="text-center">
            Telegram hisobingiz orqali kiring
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent className="flex justify-center pt-4">
          <TelegramLoginButton />
        </CardContent>
        
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            Kirish tugmasini bosish orqali siz xizmatdan foydalanish qoidalariga rozilik bildirasiz
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;