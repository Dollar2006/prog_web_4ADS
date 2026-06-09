import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader, Database, Globe, Newspaper } from 'lucide-react';
import { fetchCountryData, fetchCountryNews, type CountryData, type NewsItem } from '../services/external';
import { createPortal } from 'react-dom';
import '../styles/modal.css';

interface Country {
  id: number;
  nome: string;
  idContinente: number;
  continente: { nome: string };
  totalCidades?: number;
  populacao?: number;
  idiomaOficial?: string;
  moeda?: string;
}

interface CountryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country;
  countries: Country[];
  onCountryChange: (country: Country) => void;
}

type TabType = 'sistema' | 'externo';

const CountryDetailsModal: React.FC<CountryDetailsModalProps> = ({
  isOpen,
  onClose,
  country,
  countries,
  onCountryChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sistema');
  const [restCountryData, setRestCountryData] = useState<CountryData | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[] | null>(null);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const loadExternalData = async () => {
      setIsLoadingExternal(true);
      setRestCountryData(null);
      setNewsData(null);

      try {
        const [restData, news] = await Promise.all([
          fetchCountryData(country.nome),
          fetchCountryNews(country.nome)
        ]);
        
        setRestCountryData(restData);
        setNewsData(news);
      } catch (err) {
        console.error('Erro ao buscar dados externos do país:', err);
      } finally {
        setIsLoadingExternal(false);
      }
    };

    if (isOpen && country) {
      loadExternalData();
    }
  }, [isOpen, country]);

  const handlePrevious = () => {
    const currentIndex = countries.findIndex((c) => c.id === country.id);
    if (currentIndex > 0) {
      onCountryChange(countries[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = countries.findIndex((c) => c.id === country.id);
    if (currentIndex >= 0 && currentIndex < countries.length - 1) {
      onCountryChange(countries[currentIndex + 1]);
    }
  };

  const currentIndex = countries.findIndex((c) => c.id === country.id);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < countries.length - 1;

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container lg">
        
        {/* HEADER */}
        <header className="modal-header">
          <div className="modal-header-left">
            {restCountryData?.bandeira ? (
              <img src={restCountryData.bandeira} alt={country.nome} className="modal-flag" />
            ) : (
              <div className="modal-flag-placeholder" />
            )}
            <div className="modal-header-titles">
              <h2>{restCountryData?.nomeOficial || country.nome}</h2>
              <p>{country.nome}</p>
            </div>
            <div className="modal-badges">
              <span className="badge-blue">{country.continente?.nome}</span>
              <span className="badge-green">{country.totalCidades || 0} cidades</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        {/* CONTROLE DE ABAS */}
        <div className="modal-tabs-nav">
          <button 
            onClick={() => setActiveTab('sistema')}
            className={`modal-tab-trigger ${activeTab === 'sistema' ? 'active-sistema' : ''}`}
          >
            <Database size={16} /> Visão Geral (Sistema)
          </button>
          <button 
            onClick={() => setActiveTab('externo')}
            className={`modal-tab-trigger ${activeTab === 'externo' ? 'active-externo' : ''}`}
          >
            <Globe size={16} /> Integrações Externas (APIs)
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="modal-content">
          {isLoadingExternal && (
            <div className="modal-loading-container">
              <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
              <p className="modal-loading-text">Sincronizando dados globais do país...</p>
            </div>
          )}

          {!isLoadingExternal && activeTab === 'sistema' && (
            <div className="grid-2x2">
              <div className="info-card">
                <p className="info-card-label">POPULAÇÃO TOTAL</p>
                <p className="info-card-value">
                  {country.populacao ? country.populacao.toLocaleString('pt-BR') : 'Não informada'}
                </p>
              </div>
              <div className="info-card">
                <p className="info-card-label">IDIOMA LOCAL</p>
                <p className="info-card-value">{country.idiomaOficial || 'Não cadastrado'}</p>
              </div>
              <div className="info-card">
                <p className="info-card-label">MOEDA VIGENTE</p>
                <p className="info-card-value">{country.moeda || 'Não cadastrada'}</p>
              </div>
              <div className="info-card">
                <p className="info-card-label">CIDADES NO SISTEMA</p>
                <p className="info-card-value highlight">{country.totalCidades || 0}</p>
              </div>
            </div>
          )}

          {!isLoadingExternal && activeTab === 'externo' && (
            <div className="external-layout">
              
              {/* REST Countries Card Expandido ocupando largura total */}
              {restCountryData && (
                <div className="api-card">
                  <h4 className="card-title-api rest">
                    <Globe size={16} /> REST COUNTRIES DATA
                  </h4>
                  <div className="api-grid-data-full">
                    <div className="api-data-item">
                      <span>REGIÃO GLOBAL</span>
                      <p>{restCountryData.regiao}</p>
                    </div>
                    <div className="api-data-item">
                      <span>IDIOMA PADRÃO</span>
                      <p>{restCountryData.idioma}</p>
                    </div>
                    <div className="api-data-item">
                      <span>MOEDA FORMATADA</span>
                      <p>{restCountryData.moeda}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Notícias */}
              <div className="api-card">
                <h4 className="card-title-api news">
                  <Newspaper size={16} /> ÚLTIMAS NOTÍCIAS RELACIONADAS
                </h4>
                {newsData && newsData.length > 0 ? (
                  <div className="news-list">
                    {newsData.map((item, idx) => (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" key={idx} className="news-item-link">
                        <p className="news-title">{item.titulo}</p>
                        <div className="news-meta">
                          <span className="news-source">{item.fonte}</span>
                          <span className="news-date">{new Date(item.publicadoEm).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="news-unavailable">Nenhum artigo recente foi encontrado para este país.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer-nav">
          <button onClick={handlePrevious} disabled={!canGoPrevious} className="btn-nav">
            <ChevronLeft size={16} /> Anterior
          </button>

          <span className="nav-counter">
            {currentIndex >= 0 ? `${currentIndex + 1} de ${countries.length}` : `— de ${countries.length}`}
          </span>

          <button onClick={handleNext} disabled={!canGoNext} className="btn-nav">
            Próximo <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CountryDetailsModal;