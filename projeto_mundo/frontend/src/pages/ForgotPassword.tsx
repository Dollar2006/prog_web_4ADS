import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, Mail, Copy, Check } from 'lucide-react';
import axios from 'axios';
import '../styles/login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password', {
        email
      });

      setSuccess(response.data.message);
      setResetToken(response.data.resetToken);
      setShowToken(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao solicitar recuperação';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetClick = () => {
    navigate('/reset-password', { state: { resetToken } });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Globe size={48} className="globe-icon" />
          <h1>GeoAdmin</h1>
          <p>Recuperar Senha</p>
        </div>

        {!showToken ? (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail cadastrado</label>
                <div className="password-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Mail size={20} className="toggle-password" style={{ cursor: 'default' }} />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/login" className="link">
                Voltar para login
              </Link>
              <span className="divider">•</span>
              <Link to="/signup" className="link">
                Criar conta
              </Link>
            </div>
          </>
        ) : (
          <div className="reset-token-section">
            <div className="success-banner">
              <Check size={24} />
              <p>Email encontrado! Use o token abaixo para resetar sua senha.</p>
            </div>

            <div className="token-display">
              <div className="token-box">
                <code>{resetToken}</code>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="copy-btn"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="token-hint">Token copiado!</p>
            </div>

            <button
              onClick={handleResetClick}
              className="login-btn"
            >
              Ir para Resetar Senha
            </button>

            <button
              onClick={() => {
                setShowToken(false);
                setResetToken('');
                setEmail('');
                setSuccess('');
              }}
              className="reset-btn"
            >
              Tentar outro email
            </button>

            <div className="auth-links">
              <Link to="/login" className="link">
                Voltar para login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
