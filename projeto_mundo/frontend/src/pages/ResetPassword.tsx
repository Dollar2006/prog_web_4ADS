import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Globe, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../styles/login.css';

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pré-preencher token se vindo de ForgotPassword
  useState(() => {
    if (location.state?.resetToken) {
      setResetToken(location.state.resetToken);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!resetToken || !novaSenha || !confirmaSenha) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/reset-password', {
        resetToken,
        novaSenha,
        confirmaSenha
      });

      setSuccess(response.data.message);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao resetar senha';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Globe size={48} className="globe-icon" />
          <h1>GeoAdmin</h1>
          <p>Resetar Senha</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="resetToken">Token de Recuperação</label>
            <input
              id="resetToken"
              type="text"
              placeholder="Cole o token recebido"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <div className="password-input-wrapper">
              <input
                id="novaSenha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmaSenha">Confirmar Nova Senha</label>
            <div className="password-input-wrapper">
              <input
                id="confirmaSenha"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="toggle-password"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Resetando...' : 'Resetar Senha'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="link">
            Voltar para login
          </Link>
          <span className="divider">•</span>
          <Link to="/forgot-password" className="link">
            Enviar novo token
          </Link>
        </div>
      </div>
    </div>
  );
}
