import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface User {
  id: number;
  fullName: string;
  role: string;
  server: string;
  termsAccepted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  showTermsModal: boolean;
  loginMutation: any;
  registerMutation: any;
  logoutMutation: any;
  acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Функции для работы с API
const checkAuthStatus = async (): Promise<{ user: User } | null> => {
  try {
    console.log('🔍 Проверка статуса авторизации...');
    
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Важно для отправки cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Ответ от сервера:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        console.log('❌ Пользователь не авторизован');
        return null;
      }
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Пользователь авторизован:', data.user);
    return data;
  } catch (error) {
    console.error('🚨 Ошибка при проверке авторизации:', error);
    return null;
  }
};

const loginUser = async (credentials: { fullName: string; password: string }) => {
  console.log('🔑 Попытка входа для:', credentials.fullName);
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  console.log('📡 Ответ сервера при входе:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка входа');
  }

  const data = await response.json();
  console.log('✅ Успешный вход:', data.user);
  return data;
};

const registerUser = async (userData: { fullName: string; password: string }) => {
  console.log('📝 Попытка регистрации для:', userData.fullName);
  
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  console.log('📡 Ответ сервера при регистрации:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка регистрации');
  }

  const data = await response.json();
  console.log('✅ Успешная регистрация:', data.user);
  return data;
};

const logoutUser = async () => {
  console.log('🚪 Попытка выхода из системы...');
  
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Ответ сервера при выходе:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка при выходе');
  }

  console.log('✅ Успешный выход');
  return await response.json();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const queryClient = useQueryClient();

  // Запрос для проверки авторизации
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuthStatus,
    retry: (failureCount, error) => {
      // Не повторяем запрос при 401 ошибке
      console.log('🔄 Повторная попытка:', failureCount, error);
      return failureCount < 2 && !error?.message?.includes('401');
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const user = authData?.user || null;

  // Отслеживание изменений авторизации
  useEffect(() => {
    console.log('🔄 Состояние авторизации изменилось:', {
      isLoading,
      hasUser: !!user,
      userFullName: user?.fullName,
      error: error?.message
    });

    // Показываем модальное окно с условиями, если пользователь не принял их
    if (user && !user.termsAccepted) {
      console.log('📋 Показываем модальное окно с условиями');
      setShowTermsModal(true);
    }
  }, [user, isLoading, error]);

  // Мутация для входа
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('🎉 Вход выполнен успешно');
      queryClient.setQueryData(['auth'], data);
      toast({
        title: "Добро пожаловать!",
        description: `Привет, ${data.user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Ошибка входа:', error.message);
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для регистрации
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log('🎉 Регистрация выполнена успешно');
      queryClient.setQueryData(['auth'], data);
      toast({
        title: "Добро пожаловать!",
        description: "Аккаунт успешно создан!",
      });
    },
    onError: (error: Error) => {
      console.error('❌ Ошибка регистрации:', error.message);
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Мутация для выхода
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      console.log('🎉 Выход выполнен успешно');
      queryClient.setQueryData(['auth'], null);
      queryClient.clear(); // Очищаем весь кеш
      toast({
        title: "До свидания!",
        description: "Вы успешно вышли из системы",
      });
    },
    onError: (error: Error) => {
      console.error('❌ Ошибка выхода:', error.message);
      // Даже при ошибке очищаем локальное состояние
      queryClient.setQueryData(['auth'], null);
      queryClient.clear();
      toast({
        title: "Выход из системы",
        description: "Сессия завершена",
      });
    },
  });

  const acceptTerms = async () => {
    try {
      console.log('📋 Принятие условий использования...');
      
      const response = await fetch('/api/auth/accept-terms', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Условия приняты');
        setShowTermsModal(false);
        // Обновляем данные пользователя
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        toast({
          title: "Условия приняты",
          description: "Добро пожаловать в систему!",
        });
      }
    } catch (error) {
      console.error('❌ Ошибка при принятии условий:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось принять условия",
        variant: "destructive",
      });
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    showTermsModal,
    loginMutation,
    registerMutation,
    logoutMutation,
    acceptTerms,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}