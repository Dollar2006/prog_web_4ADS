import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin } from 'lucide-react';
import Table from '../components/Table';
import type { Column } from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import CityForm from '../components/CityForm';
import { cityService, countryService, continentService } from '../services/api';
import '../styles/App.css';

interface City {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  pais: { nome: string; idContinente: number; continente: { nome: string } };
}

const Cities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [allContinents, setAllContinents] = useState<any[]>([]);
  const [selectedContinentId, setSelectedContinentId] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const loadData = async () => {
    try {
      const [citiesData, countriesData, continentsData] = await Promise.all([
        cityService.getCities(selectedCountryId ? { countryId: parseInt(selectedCountryId) } : selectedContinentId ? { continentId: parseInt(selectedContinentId) } : undefined),
        countryService.getCountries(),
        continentService.getContinents(),
      ]);
      setCities(citiesData);
      setAllCountries(countriesData);
      setAllContinents(continentsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, [selectedContinentId, selectedCountryId]);

  const filteredCities = cities.filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns: Column<City>[] = [
    {
      header: 'CIDADE',
      key: 'nome',
      render: (item) => (
        <div className="cell-with-icon">
          <span className="cell-icon-wrapper" style={{ color: '#a855f7' }}><MapPin size={18} /></span>
          <span>{item.nome}</span>
        </div>
      ),
    },
    {
      header: 'PAÍS',
      key: 'pais',
      render: (item) => <span className="badge-pill">{item.pais?.nome || 'N/A'}</span>,
    },
    {
      header: 'COORDENADAS',
      key: 'latitude',
      render: (item) => <span className="text-coords">{Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}</span>,
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Cidades</h1>
          <div className="page-subtitle">{filteredCities.length} cidades cadastradas</div>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedCity(null); setModalOpen(true); }}>
          <Plus size={18} /> Nova Cidade
        </button>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Buscar cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={selectedContinentId} onChange={(e) => { setSelectedContinentId(e.target.value); setSelectedCountryId(''); }} className="custom-select">
            <option value="">Todos os continentes</option>
            {allContinents.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={selectedCountryId} onChange={(e) => setSelectedCountryId(e.target.value)} className="custom-select">
            <option value="">Todos os países</option>
            {allCountries.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCities.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        currentPage={currentPage}
        totalItems={filteredCities.length}
        isLoading={false}
        onPageChange={(page) => setCurrentPage(page)}
        onEdit={(item) => { setSelectedCity(item); setModalOpen(true); }}
        onDelete={(item) => { setSelectedCity(item); setConfirmOpen(true); }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedCity ? 'Editar Cidade' : 'Nova Cidade'}>
        <CityForm city={selectedCity ?? undefined} onSuccess={loadData} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={async () => {
        if (selectedCity) { await cityService.deleteCity(selectedCity.id); loadData(); setConfirmOpen(false); }
      }} title="Excluir" message="Confirma?" />
    </div>
  );
};

export default Cities;