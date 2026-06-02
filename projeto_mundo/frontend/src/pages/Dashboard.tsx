import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Flag, MapPin, TrendingUp, ArrowUpRight } from 'lucide-react';
import { continentService, healthService } from '../services/api';
import '../styles/Dashboard.css';

interface DashboardStats {
  totalContinentes: number;
  totalPaises: number;
  totalCidades: number;
  continenteMaisPaises: {
    nome: string;
    totalPaises: number;
  } | null;
  ultimosRegistros: {
    continentes: Array<{ id: number; nome: string; criadoEm: string }>;
    paises: Array<{ id: number; nome: string; criadoEm: string; continente: { nome: string } }>;
    cidades: Array<{ id: number; nome: string; criadoEm: string; pais: { nome: string } }>;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, healthStatus] = await Promise.all([
          continentService.getDashboardStats(),
          healthService.checkHealth(),
        ]);
        setStats(statsData);
        setIsHealthy(healthStatus);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) return <div className="dashboard-loading">Carregando dashboard...</div>;
  if (!stats) return <div className="dashboard-error">Erro ao carregar dados do dashboard</div>;

  // Mock estrutural baseado estritamente na proporção visual do Figma enviado
  const barChartData = [
    { name: 'América do...', countries: 4, cities: 5 },
    { name: 'Europa', countries: 4, cities: 4 },
    { name: 'Ásia', countries: 3, cities: 2 },
    { name: 'América do...', countries: 3, cities: 5 },
    { name: 'África', countries: 2, cities: 2 },
    { name: 'Oceania', countries: 2, cities: 2 },
  ];

  const donutData = [
    { name: 'América do Sul', value: 4, color: '#10b981' },
    { name: 'Europa', value: 4, color: '#3b82f6' },
    { name: 'Ásia', value: 3, color: '#a855f7' },
    { name: 'América do Norte', value: 3, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Painel</h1>
          <p>Visão geral do sistema GeoAdmin</p>
        </div>
        <div className={`system-status ${isHealthy ? 'healthy' : 'unhealthy'}`}>
          <span className="status-pulse"></span>
          <span>Sistema {isHealthy ? 'ativo' : 'inativo'}</span>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card clickable" onClick={() => navigate('/continents')}>
          <div className="card-header">
            <div className="icon-wrapper blue"><Globe size={20} /></div>
            <ArrowUpRight className="arrow-icon" size={18} />
          </div>
          <span className="card-title">CONTINENTES</span>
          <h2 className="card-value">{stats.totalContinentes}</h2>
          <span className="card-subtitle">{stats.totalContinentes} com países</span>
        </div>

        <div className="metric-card clickable" onClick={() => navigate('/countries')}>
          <div className="card-header">
            <div className="icon-wrapper green"><Flag size={20} /></div>
            <ArrowUpRight className="arrow-icon" size={18} />
          </div>
          <span className="card-title">PAÍSES</span>
          <h2 className="card-value">{stats.totalPaises}</h2>
          <span className="card-subtitle">em 6 continentes</span>
        </div>

        <div className="metric-card clickable" onClick={() => navigate('/cities')}>
          <div className="card-header">
            <div className="icon-wrapper purple"><MapPin size={20} /></div>
            <ArrowUpRight className="arrow-icon" size={18} />
          </div>
          <span className="card-title">CIDADES</span>
          <h2 className="card-value">{stats.totalCidades}</h2>
          <span className="card-subtitle">em {stats.totalPaises} países</span>
        </div>

        {stats.continenteMaisPaises && (
          <div className="metric-card">
            <div className="card-header">
              <div className="icon-wrapper orange"><TrendingUp size={20} /></div>
            </div>
            <span className="card-title">MAIS PAÍSES</span>
            <h2 className="card-value truncate">{stats.continenteMaisPaises.nome}</h2>
            <span className="card-subtitle">{stats.continenteMaisPaises.totalPaises} países</span>
          </div>
        )}
      </section>

      <section className="content-grid">
        {/* Gráfico de Barras Principal */}
        <div className="main-chart-card">
          <div className="chart-header">
            <h3>Países por Continente</h3>
            <p>Distribuição geográfica dos países</p>
          </div>
          
          <div className="chart-wrapper">
            <div className="chart-y-axis">
              <span>8</span><span>6</span><span>4</span><span>2</span><span>0</span>
            </div>
            <div className="chart-bars-container">
              {barChartData.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="chart-inner-bars">
                    <div className="bar-item countries" style={{ height: `${(item.countries / 8) * 100}%` }}></div>
                    <div className="bar-item cities" style={{ height: `${(item.cities / 8) * 100}%` }}></div>
                  </div>
                  <span className="chart-label">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-bullet" style={{ backgroundColor: '#10b981' }}></span>
              <span>Países</span>
            </div>
            <div className="legend-item">
              <span className="legend-bullet" style={{ backgroundColor: '#3b82f6' }}></span>
              <span>Cidades</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Rosca Lateral */}
        <div className="side-chart-card">
          <div className="chart-header">
            <h3>Distribuição</h3>
            <p>Países por continente</p>
          </div>
          
          <div className="donut-container">
            <div className="donut-svg-wrapper">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut-svg">
                <circle className="donut-segment" cx="21" cy="21" r="15.915" stroke="#e2e8f0" strokeOpacity="0.05" />
                <circle className="donut-segment" cx="21" cy="21" r="15.915" stroke="#10b981" strokeDasharray="28 72" strokeDashoffset="0" />
                <circle className="donut-segment" cx="21" cy="21" r="15.915" stroke="#3b82f6" strokeDasharray="28 72" strokeDashoffset="-28" />
                <circle className="donut-segment" cx="21" cy="21" r="15.915" stroke="#a855f7" strokeDasharray="22 78" strokeDashoffset="-56" />
                <circle className="donut-segment" cx="21" cy="21" r="15.915" stroke="#f59e0b" strokeDasharray="22 78" strokeDashoffset="-78" />
              </svg>
            </div>

            <div className="donut-legend-list">
              {donutData.map((item, index) => (
                <div key={index} className="donut-legend-row">
                  <div className="donut-legend-left">
                    <span className="legend-bullet" style={{ backgroundColor: item.color }}></span>
                    <span style={{ color: '#64748b' }}>{item.name}</span>
                  </div>
                  <span className="donut-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;