import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { setAuthToken, getAuthToken, removeAuthToken, getAuthHeaders } from '@/utils/auth';

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
      headers: getAuthHeaders(),
    });

    console.log('📡 Ответ от сервера:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        console.log('❌ Пользователь не авторизован');
        removeAuthToken();
        return null;
      }
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Пользователь авторизован:', data.user);
    return data;
  } catch (error) {
    console.error('🚨 Ошибка при проверке авторизации:', error);
    removeAuthToken();
    return null;
  }
};

const loginUser = async (credentials: { fullName: string; password: string }) => {
  console.log('🔑 Попытка входа для:', credentials.fullName);
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
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
  console.log('✅ Успешный вход:', data);
  
  // Сохраняем токен
  if (data.token) {
    setAuthToken(data.token);
  }
  
  return data;
};

const registerUser = async (userData: { fullName: string; password: string }) => {
  console.log('📝 Попытка регистрации для:', userData.fullName);
  
  const response = await fetch('/api/auth/register', {
    method: 'POST',
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
  console.log('✅ Успешная регистрация:', data);
  
  // Сохраняем токен
  if (data.token) {
    setAuthToken(data.token);
  }
  
  return data;
};

const logoutUser = async () => {
  console.log('🚪 Попытка выхода из системы...');
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    console.log('📡 Ответ сервера при выходе:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при выходе');
    }
  } finally {
    // Всегда удаляем токен при выходе
    removeAuthToken();
  }

  return { success: true };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const queryClient = useQueryClient();

  // Проверяем токен при загрузке
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      queryClient.setQueryData(['auth'], null);
    }
  }, [queryClient]);

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
    enabled: !!getAuthToken(), // Запускаем только если есть токен
  });

  const user = authData?.user || null;

  // Отслеживание изменений авторизации
  useEffect(() => {
    console.log('🔄 Состояние авторизации изменилось:', {
      isLoading,
      hasUser: !!user,
      userFullName: user?.fullName,
      error: error?.message,
      hasToken: !!getAuthToken()
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
      removeAuthToken();
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
      removeAuthToken();
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
      removeAuthToken();
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
      removeAuthToken();
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
        headers: getAuthHeaders(),
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
        description: "Не удалось принять условия использования",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        showTermsModal,
        loginMutation,
        registerMutation,
        logoutMutation,
        acceptTerms,
      }}
    >
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