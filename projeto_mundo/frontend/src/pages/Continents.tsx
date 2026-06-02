import React, { useState, useEffect } from 'react';
import { Plus, Search, Globe } from 'lucide-react';
import Table from '../components/Table';
import type { Column } from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import ContinentForm from '../components/ContinentForm';
import { continentService } from '../services/api';
import '../styles/App.css';

interface Continent {
  id: number;
  nome: string;
  descricao: string | null;
  totalPaises?: number; 
  totalCidades?: number;
}

const Continents: React.FC = () => {
  const [continents, setContinents] = useState<Continent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null);

  const loadContinents = async () => {
    setIsLoading(true);
    try {
      const data = await continentService.getContinents();
      setContinents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContinents();
  }, []);

  const filteredContinents = continents.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Continent>[] = [
    {
      header: 'CONTINENTE',
      key: 'nome',
      render: (item) => (
        <div className="cell-with-icon">
          <span className="cell-icon-wrapper"><Globe size={18} /></span>
          <span>{item.nome}</span>
        </div>
      ),
    },
    {
      header: 'PAÍSES',
      key: 'id',
      render: (item) => <span className="count-green">{item.totalPaises ?? 0}</span>,
    },
    {
      header: 'CIDADES',
      key: 'id',
      render: (item) => <span className="count-purple">{item.totalCidades ?? 0}</span>,
    },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Continentes</h1>
          <div className="page-subtitle">{filteredContinents.length} continentes cadastrados</div>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedContinent(null); setModalOpen(true); }}>
          <Plus size={18} /> Novo Continente
        </button>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar continente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredContinents.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        isLoading={isLoading}
        currentPage={currentPage}
        totalItems={filteredContinents.length}
        onPageChange={(page) => setCurrentPage(page)}
        onEdit={(item) => { setSelectedContinent(item); setModalOpen(true); }}
        onDelete={(item) => { setSelectedContinent(item); setConfirmOpen(true); }}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedContinent ? 'Editar Continente' : 'Novo Continente'}>
        <ContinentForm continent={selectedContinent ?? undefined} onSuccess={loadContinents} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={async () => {
        if (selectedContinent) { await continentService.deleteContinent(selectedContinent.id); loadContinents(); setConfirmOpen(false); }
      }} title="Confirmar Exclusão" message={`Deseja excluir ${selectedContinent?.nome}?`} />
    </div>
  );
};

export default Continents;