import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("token");
  
  // Используем переменную окружения для API URL или localhost как fallback
  const baseUrl = "https://autocatalog-production.up.railway.app/api";
  const apiUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  
  console.log('Making API request to:', apiUrl, 'with data:', data);
  
  const res = await fetch(apiUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("token");
    
    let url = queryKey[0] as string;
    
    // Используем переменную окружения для API URL или localhost как fallback
    const baseUrl = "https://autocatalog-production.up.railway.app/api";
    const apiUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    
    // Добавляем параметры запроса, если они есть
    let finalUrl = apiUrl;
    if (queryKey[1] && typeof queryKey[1] === 'object') {
      const params = new URLSearchParams();
      const filters = queryKey[1] as Record<string, any>;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        finalUrl = `${apiUrl}?${queryString}`;
      }
    }
    
    console.log('Making query request to:', finalUrl);
    
    const res = await fetch(finalUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
