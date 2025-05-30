import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  showTermsModal: boolean;
  acceptTerms: () => void;
};

type LoginData = {
  fullName: string;
  password: string;
};

type RegisterData = LoginData;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [showTermsModal, setShowTermsModal] = useState(false);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const userData = data?.user || data;

        if (userData && userData.id && userData.fullName) {
          return userData;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    retry: 1,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (user?.id) {
      const termsAcceptedKey = `terms-accepted-${user.id}`;
      const hasAcceptedTerms = localStorage.getItem(termsAcceptedKey);

      if (!hasAcceptedTerms) {
        setShowTermsModal(true);
      }
    }
  }, [user]);

  const acceptTerms = () => {
    if (user?.id) {
      const termsAcceptedKey = `terms-accepted-${user.id}`;
      localStorage.setItem(termsAcceptedKey, 'true');
      setShowTermsModal(false);
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка авторизации");
      }

      const data = await response.json();
      const userData = data?.user || data;

      if (!userData?.id) {
        throw new Error("Неверная структура данных пользователя");
      }

      return userData;
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/auth/me"], userData);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Успешная авторизация",
        description: `Добро пожаловать, ${userData.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка авторизации",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка регистрации");
      }

      const data = await response.json();
      const userData = data?.user || data;

      if (!userData?.id) {
        throw new Error("Неверная структура данных пользователя");
      }

      return userData;
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/auth/me"], userData);
      toast({
        title: "Успешная регистрация",
        description: `Добро пожаловать в АвтоКаталог, ${userData.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      toast({
        title: "Вы вышли из системы",
        description: "До свидания!",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        showTermsModal,
        acceptTerms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
