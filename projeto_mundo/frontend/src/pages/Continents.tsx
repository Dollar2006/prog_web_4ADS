import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../components/Table';
import type { Column } from '../components/Table';
import Modal from '../components/Modal';

interface Continent {
  id: number;
  nome: string;
  descricao: string;
}

const Continents: React.FC = () => {
  const [continents, setContinents] = useState<Continent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const fetchContinents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/continents');
      setContinents(response.data);
    } catch (err) {
      setError('Erro ao carregar os continentes. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContinents();
  }, []);

  const openCreateModal = () => {
    setSelectedContinent(null);
    setNome('');
    setDescricao('');
    setIsModalOpen(true);
  };

  const openEditModal = (continent: Continent) => {
    setSelectedContinent(continent);
    setNome(continent.nome);
    setDescricao(continent.descricao);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (continent: Continent) => {
    setSelectedContinent(continent);
    setIsConfirmOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedContinent) {
        await axios.put(`/api/continents/${selectedContinent.id}`, { nome, descricao });
      } else {
        await axios.post('/api/continents', { nome, descricao });
      }
      setIsModalOpen(false);
      fetchContinents();
    } catch (err) {
      alert('Erro ao salvar o continente.');
    }
  };

  const handleDelete = async () => {
    if (!selectedContinent) return;
    try {
      await axios.delete(`/api/continents/${selectedContinent.id}`);
      setIsConfirmOpen(false);
      fetchContinents();
      // Adjust current page if necessary
      const totalPages = Math.ceil((continents.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      alert('Erro ao excluir o continente.');
    }
  };

  const columns: Column<Continent>[] = [
    { header: 'ID', key: 'id' },
    { header: 'Nome', key: 'nome' },
    { header: 'Descrição', key: 'descricao' },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const slicedData = continents.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#dc3545', padding: '2rem', textAlign: 'center' }}>
        <h2>{error}</h2>
        <button onClick={fetchContinents} style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}>
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#333' }}>Continentes</h1>
        <button 
          onClick={openCreateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Novo Continente
        </button>
      </div>

      <Table
        columns={columns}
        data={slicedData}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
        currentPage={currentPage}
        totalItems={continents.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedContinent ? 'Editar Continente' : 'Novo Continente'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              style={{ padding: '8px 16px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Salvar
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="nome" style={{ fontWeight: 'bold' }}>Nome</label>
            <input 
              id="nome"
              type="text" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="descricao" style={{ fontWeight: 'bold' }}>Descrição</label>
            <textarea 
              id="descricao"
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px', resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar Exclusão"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              onClick={() => setIsConfirmOpen(false)} 
              style={{ padding: '8px 16px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleDelete} 
              style={{ padding: '8px 16px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Excluir
            </button>
          </div>
        }
      >
        <p style={{ margin: '10px 0' }}>
          Tem certeza que deseja excluir o continente <strong>{selectedContinent?.nome}</strong>?
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
};

export default Continents;
