import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Category from "@/pages/category";
import MyProducts from "@/pages/my-products";
import Favorites from "@/pages/favorites";
import Messages from "@/pages/messages";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

// Setup auth header interceptor
const token = localStorage.getItem("token");
if (token) {
  queryClient.getQueryDefaults().headers = {
    ...queryClient.getQueryDefaults().headers,
    Authorization: `Bearer ${token}`,
  };
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/category/:categoryName" component={Category} />
      
      {isAuthenticated && (
        <>
          <Route path="/my-products" component={MyProducts} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/messages" component={Messages} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
