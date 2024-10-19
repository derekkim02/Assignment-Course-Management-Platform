import React from 'react';
import './App.css';
import { AuthProvider } from './components/auth/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from './components/routes/AppRouter';
import { AlertBoxProvider } from './components/AlertBox';

function App () {
  const queryClient = new QueryClient();
  return (
    <div className="App">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AlertBoxProvider>
            <AppRouter/>
          </AlertBoxProvider>
        </QueryClientProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
