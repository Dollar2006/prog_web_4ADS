import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
  Database,
  CloudSun,
  MapPin
} from 'lucide-react';

import { createPortal } from 'react-dom';
import { fetchWeatherByCityName, type WeatherData } from '../services/external';

interface City {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  pais: {
    nome: string;
    continente: {
      nome: string;
    };
  };
}

interface CityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: City;
  cities: City[];
  onCityChange: (city: City) => void;
}

type TabType = 'sistema' | 'clima';

const CityDetailsModal: React.FC<CityDetailsModalProps> = ({
  isOpen,
  onClose,
  city,
  cities,
  onCityChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sistema');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

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
    const loadWeather = async () => {
      setIsLoadingWeather(true);
      setWeatherData(null);

      try {
        const weather = await fetchWeatherByCityName(
          city.nome
        );

        setWeatherData(weather);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    if (isOpen && city) {
      loadWeather();
    }
  }, [city, isOpen]);

  const currentIndex = cities.findIndex(c => c.id === city.id);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onCityChange(cities[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < cities.length - 1) {
      onCityChange(cities[currentIndex + 1]);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container lg">

        {/* HEADER */}
        <header className="modal-header">

          <div className="modal-header-left">
            <div className="modal-flag-placeholder">
              <MapPin size={30} />
            </div>

            <div className="modal-header-titles">
              <h2>{city.nome}</h2>
              <p>{city.pais.nome}</p>
            </div>

            <div className="modal-badges">
              <span className="badge-blue">
                {city.pais.continente.nome}
              </span>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </header>

        {/* TABS */}
        <div className="modal-tabs-nav">

          <button
            onClick={() => setActiveTab('sistema')}
            className={`modal-tab-trigger ${
              activeTab === 'sistema'
                ? 'active-sistema'
                : ''
            }`}
          >
            <Database size={16}/>
            Sistema
          </button>

          <button
            onClick={() => setActiveTab('clima')}
            className={`modal-tab-trigger ${
              activeTab === 'clima'
                ? 'active-externo'
                : ''
            }`}
          >
            <CloudSun size={16}/>
            OpenWeather
          </button>

        </div>

        {/* CONTEÚDO */}
        <div className="modal-content">

          {isLoadingWeather && (
            <div className="modal-loading-container">
              <Loader
                size={40}
                style={{
                  animation: 'spin 1s linear infinite'
                }}
              />
              <p>Buscando dados climáticos...</p>
            </div>
          )}

          {!isLoadingWeather &&
            activeTab === 'sistema' && (
              <div className="grid-2x2">

                <div className="info-card">
                  <p className="info-card-label">LATITUDE</p>
                  <p className="info-card-value">
                    {city.latitude}
                  </p>
                </div>

                <div className="info-card">
                  <p className="info-card-label">LONGITUDE</p>
                  <p className="info-card-value">
                    {city.longitude}
                  </p>
                </div>

                <div className="info-card">
                  <p className="info-card-label">PAÍS</p>
                  <p className="info-card-value">
                    {city.pais.nome}
                  </p>
                </div>

                <div className="info-card">
                  <p className="info-card-label">CONTINENTE</p>
                  <p className="info-card-value">
                    {city.pais.continente.nome}
                  </p>
                </div>

              </div>
          )}

          {!isLoadingWeather &&
            activeTab === 'clima' && (
              <div className="external-layout">

                {weatherData ? (
                  <div className="api-card">

                    <h4 className="card-title-api weather">
                      <CloudSun size={16}/>
                      OPENWEATHER
                    </h4>

                    <div className="api-grid-data-full">

                      <div className="api-data-item">
                        <span>TEMPERATURA</span>
                        <p>{weatherData.temperatura}°C</p>
                      </div>

                      <div className="api-data-item">
                        <span>CONDIÇÃO</span>
                        <p>{weatherData.descricao}</p>
                      </div>

                      <div className="api-data-item">
                        <span>CIDADE API</span>
                        <p>{weatherData.cidade}</p>
                      </div>

                    </div>

                    <div
                      style={{
                        textAlign: 'center',
                        marginTop: '20px'
                      }}
                    >
                    </div>

                  </div>
                ) : (
                  <p>
                    Não foi possível obter dados climáticos.
                  </p>
                )}

              </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="modal-footer-nav">

          <button
            className="btn-nav"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft size={16}/>
            Anterior
          </button>

          <span className="nav-counter">
            {currentIndex + 1} de {cities.length}
          </span>

          <button
            className="btn-nav"
            onClick={handleNext}
            disabled={currentIndex >= cities.length - 1}
          >
            Próximo
            <ChevronRight size={16}/>
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
};

export default CityDetailsModal;