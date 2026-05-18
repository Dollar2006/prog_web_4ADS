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

interface Country {
  id: number;
  nome: string;
  populacao: number;
  idiomaOficial: string;
  moeda: string;
  idContinente: number;
  continente?: Continent;
}

const getContinentBadgeStyle = (continentName: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    'América do Sul': { bg: '#e2f0d9', text: '#385723' },
    'Europa': { bg: '#c9daf8', text: '#1c4587' },
    'Ásia': { bg: '#fce5cd', text: '#b45f06' },
    'América do Norte': { bg: '#fff2cc', text: '#7f6000' },
    'África': { bg: '#f4cccc', text: '#660000' },
    'Oceania': { bg: '#d9ead3', text: '#274e13' },
  };
  const style = colors[continentName] || { bg: '#f3f3f3', text: '#333333' };
  return {
    backgroundColor: style.bg,
    color: style.text,
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'inline-block',
  };
};

const Countries: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [continents, setContinents] = useState<Continent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilterContinent, setSelectedFilterContinent] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Form Fields
  const [nome, setNome] = useState('');
  const [populacao, setPopulacao] = useState<number | ''>('');
  const [idiomaOficial, setIdiomaOficial] = useState('');
  const [moeda, setMoeda] = useState('');
  const [idContinente, setIdContinente] = useState<number | ''>('');

  const fetchContinents = async () => {
    try {
      const response = await axios.get('/api/continents');
      setContinents(response.data);
    } catch (err) {
      console.error('Erro ao carregar continentes:', err);
    }
  };

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/countries';
      if (selectedFilterContinent) {
        url += `?continentId=${selectedFilterContinent}`;
      }
      const response = await axios.get(url);
      setCountries(response.data);
    } catch (err) {
      setError('Erro ao carregar os países. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchContinents();
  }, []);

  // Fetch countries when filter changes
  useEffect(() => {
    fetchCountries();
    setCurrentPage(1); // Reset page to 1 when filter changes
  }, [selectedFilterContinent]);

  const openCreateModal = () => {
    setSelectedCountry(null);
    setNome('');
    setPopulacao('');
    setIdiomaOficial('');
    setMoeda('');
    setIdContinente(continents.length > 0 ? continents[0].id : '');
    setIsModalOpen(true);
  };

  const openEditModal = (country: Country) => {
    setSelectedCountry(country);
    setNome(country.nome);
    setPopulacao(country.populacao);
    setIdiomaOficial(country.idiomaOficial);
    setMoeda(country.moeda);
    setIdContinente(country.idContinente);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (country: Country) => {
    setSelectedCountry(country);
    setIsConfirmOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idContinente) {
      alert('Por favor, selecione um continente.');
      return;
    }
    const payload = {
      nome,
      populacao: Number(populacao),
      idiomaOficial,
      moeda,
      idContinente: Number(idContinente),
    };

    try {
      if (selectedCountry) {
        await axios.put(`/api/countries/${selectedCountry.id}`, payload);
      } else {
        await axios.post('/api/countries', payload);
      }
      setIsModalOpen(false);
      fetchCountries();
    } catch (err) {
      alert('Erro ao salvar o país.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCountry) return;
    try {
      await axios.delete(`/api/countries/${selectedCountry.id}`);
      setIsConfirmOpen(false);
      fetchCountries();
      // Adjust current page if necessary
      const totalPages = Math.ceil((countries.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      alert('Erro ao excluir o país.');
    }
  };

  const columns: Column<Country>[] = [
    { header: 'Nome', key: 'nome' },
    {
      header: 'População',
      key: 'populacao',
      render: (item) => item.populacao.toLocaleString(),
    },
    { header: 'Idioma Oficial', key: 'idiomaOficial' },
    { header: 'Moeda', key: 'moeda' },
    {
      header: 'Continente',
      key: 'idContinente',
      render: (item) => (
        <span style={getContinentBadgeStyle(item.continente?.nome || '')}>
          {item.continente?.nome || 'N/A'}
        </span>
      ),
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const slicedData = countries.slice(startIndex, startIndex + pageSize);

  if (loading && continents.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Países</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Gerencie os países do mundo.</p>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + Novo País
        </button>
      </div>

      {/* Filter and selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="filterContinent" style={{ fontWeight: 'bold', color: '#555' }}>Filtrar por Continente:</label>
        <select
          id="filterContinent"
          value={selectedFilterContinent}
          onChange={(e) => setSelectedFilterContinent(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            minWidth: '200px',
          }}
        >
          <option value="">Todos os continentes</option>
          {continents.map((continent) => (
            <option key={continent.id} value={continent.id}>
              {continent.nome}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
          <h3>Carregando países...</h3>
        </div>
      ) : error ? (
        <div style={{ color: '#dc3545', padding: '2rem', textAlign: 'center' }}>
          <h2>{error}</h2>
          <button onClick={fetchCountries} style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <Table
          columns={columns}
          data={slicedData}
          onEdit={openEditModal}
          onDelete={openDeleteConfirm}
          currentPage={currentPage}
          totalItems={countries.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCountry ? 'Editar País' : 'Novo País'}
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
              style={{ padding: '8px 16px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Salvar
            </button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="countryNome" style={{ fontWeight: 'bold' }}>Nome do País</label>
            <input
              id="countryNome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="countryPopulacao" style={{ fontWeight: 'bold' }}>População</label>
            <input
              id="countryPopulacao"
              type="number"
              value={populacao}
              onChange={(e) => setPopulacao(e.target.value === '' ? '' : Number(e.target.value))}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="countryIdioma" style={{ fontWeight: 'bold' }}>Idioma Oficial</label>
            <input
              id="countryIdioma"
              type="text"
              value={idiomaOficial}
              onChange={(e) => setIdiomaOficial(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="countryMoeda" style={{ fontWeight: 'bold' }}>Moeda</label>
            <input
              id="countryMoeda"
              type="text"
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label htmlFor="countryContinent" style={{ fontWeight: 'bold' }}>Continente</label>
            <select
              id="countryContinent"
              value={idContinente}
              onChange={(e) => setIdContinente(Number(e.target.value))}
              required
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {continents.map((continent) => (
                <option key={continent.id} value={continent.id}>
                  {continent.nome}
                </option>
              ))}
            </select>
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
          Tem certeza que deseja excluir o país <strong>{selectedCountry?.nome}</strong>?
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
};

export default Countries;
