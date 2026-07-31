import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { AuthProvider } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';

import HomePage from '@/pages/home';
import PropertiesPage from '@/pages/properties';
import PropertyDetailPage from '@/pages/property-detail';
import CreatePropertyPage from '@/pages/create-property';
import EditPropertyPage from '@/pages/edit-property';
import DashboardPage from '@/pages/dashboard';
import InquiriesPage from '@/pages/inquiries';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';

// Setup custom fetch auth header
setAuthTokenGetter(() => localStorage.getItem('re_token'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/properties/new" component={CreatePropertyPage} />
        <Route path="/properties/:id/edit" component={EditPropertyPage} />
        <Route path="/properties/:id" component={PropertyDetailPage} />
        
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/inquiries" component={InquiriesPage} />
        
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
