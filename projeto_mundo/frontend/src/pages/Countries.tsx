import React, { useState, useEffect } from 'react';
import { Plus, Search, Flag } from 'lucide-react';
import Table from '../components/Table';
import type { Column } from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import CountryForm from '../components/CountryForm';
import { countryService, continentService } from '../services/api';
import '../styles/App.css';

interface Country {
  id: number;
  nome: string;
  idContinente: number;
  continente: { nome: string };
  totalCidades?: number;
}

const Countries: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContinentId, setSelectedContinentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [countriesData, continentsData] = await Promise.all([
          countryService.getCountries(selectedContinentId ? parseInt(selectedContinentId, 10) : undefined),
          continentService.getContinents(),
        ]);
        setCountries(countriesData);
        setContinents(continentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedContinentId]);

  const filteredCountries = countries.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Country>[] = [
    {
      header: 'PAÍS',
      key: 'nome',
      render: (item) => (
        <div className="cell-with-icon">
          <span className="cell-icon-wrapper" style={{ color: '#10b981' }}><Flag size={18} /></span>
          <span>{item.nome}</span>
        </div>
      ),
    },
    {
      header: 'CONTINENTE',
      key: 'idContinente',
      render: (item) => <span className="badge-pill">{item.continente?.nome || 'N/A'}</span>,
    },
    {
      header: 'CIDADES',
      key: 'id',
      render: (item) => <span className="count-green">{item.totalCidades ?? 0}</span>,
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Países</h1>
          <div className="page-subtitle">{filteredCountries.length} registros no sistema</div>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedCountry(null); setModalOpen(true); }}>
          <Plus size={18} /> Novo País
        </button>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={selectedContinentId} onChange={(e) => setSelectedContinentId(e.target.value)} className="custom-select" style={{ maxWidth: '200px' }}>
            <option value="">Todos</option>
            {continents.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCountries.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        isLoading={isLoading}
        currentPage={currentPage}
        totalItems={filteredCountries.length}
        onPageChange={(page) => setCurrentPage(page)}
        onEdit={(item) => { setSelectedCountry(item); setModalOpen(true); }}
        onDelete={(item) => { setSelectedCountry(item); setConfirmOpen(true); }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedCountry ? 'Editar País' : 'Novo País'}>
        <CountryForm country={selectedCountry || undefined} onSuccess={() => setSelectedContinentId(selectedContinentId)} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={async () => {
        if (selectedCountry) { await countryService.deleteCountry(selectedCountry.id); setConfirmOpen(false); }
      }} title="Excluir País" message="Tem certeza?" />
    </div>
  );
};

export default Countries;