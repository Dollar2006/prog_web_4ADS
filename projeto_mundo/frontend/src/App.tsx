import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import './styles/App.css';
import Continents from './pages/Continents';
import Countries from './pages/Countries';
import Cities from './pages/Cities';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Outras páginas (placeholders)
const Home = () => <div className="page-content"><h1>🌍 Bem-vindo ao Mundo App</h1><p>Explore dados globais.</p></div>;
const Noticias = () => <div className="page-content"><h1>📰 Notícias</h1><p>Página de notícias.</p></div>;

// Componente para proteger rotas
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="page-content"><h1>Carregando...</h1></div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

function App() {
  const { token } = useAuth();

  return (
    <Router>
      {token ? (
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/continents" element={<Continents />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/continentes" element={<Continents />} />
              <Route path="/paises" element={<Countries />} />
              <Route path="/cidades" element={<Cities />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
