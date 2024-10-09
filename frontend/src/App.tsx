import './App.css';
import { AuthProvider } from './components/auth/AuthContext';
import AppRouter from './components/routes/AppRouter';


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRouter/>
      </AuthProvider>
    </div>
  );
}

export default App;
