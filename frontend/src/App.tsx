import React from 'react';
import './App.css';
import { AuthProvider } from './components/auth/AuthContext';
import AppRouter from './components/routes/AppRouter';
import { AlertBoxProvider } from './components/AlertBox';

function App () {
  return (
    <div className="App">
      <AuthProvider>
        <AlertBoxProvider>
          <AppRouter/>
        </AlertBoxProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
