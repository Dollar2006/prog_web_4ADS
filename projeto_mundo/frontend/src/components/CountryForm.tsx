import React, { useState, useEffect } from 'react';
import { countryService, continentService } from '../services/api';

interface CountryFormProps {
  country?: { 
    id: number; 
    nome: string; 
    populacao: number; 
    idiomaOficial: string; 
    moeda: string; 
    idContinente: number; 
  };
  onSuccess: () => void;
  onClose: () => void;
}

const CountryForm: React.FC<CountryFormProps> = ({ country, onSuccess, onClose }) => {
  const [nome, setNome] = useState('');
  const [populacao, setPopulacao] = useState('');
  const [idiomaOficial, setIdiomaOficial] = useState('');
  const [moeda, setMoeda] = useState('');
  const [idContinente, setIdContinente] = useState('');
  const [continents, setContinents] = useState<{ id: number; nome: string }[]>([]);
  const [isLoadingContinents, setIsLoadingContinents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadContinents = async () => {
      try {
        const data = await continentService.getContinents();
        setContinents(data);
      } catch (err) {
        setError('Erro ao carregar continentes');
      } finally {
        setIsLoadingContinents(false);
      }
    };
    loadContinents();
  }, []);

  useEffect(() => {
    if (country) {
      setNome(country.nome);
      setPopulacao(country.populacao.toString());
      setIdiomaOficial(country.idiomaOficial);
      setMoeda(country.moeda);
      setIdContinente(country.idContinente.toString());
    }
  }, [country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim() || !populacao || !idiomaOficial.trim() || !moeda.trim() || !idContinente) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (parseInt(populacao) < 0) {
      setError('A população não pode ser negativa');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        nome,
        populacao: parseInt(populacao),
        idiomaOficial,
        moeda,
        idContinente: parseInt(idContinente),
      };

      if (country?.id) {
        await countryService.updateCountry(country.id, data);
      } else {
        await countryService.createCountry(data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar país');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="nome">Nome *</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          placeholder="Ex: Brasil"
        />
      </div>
      <div className="form-group">
        <label htmlFor="populacao">População *</label>
        <input
          id="populacao"
          type="number"
          value={populacao}
          onChange={(e) => setPopulacao(e.target.value)}
          required
          placeholder="Ex: 214000000"
        />
      </div>
      <div className="form-group">
        <label htmlFor="idiomaOficial">Idioma Oficial *</label>
        <input
          id="idiomaOficial"
          type="text"
          value={idiomaOficial}
          onChange={(e) => setIdiomaOficial(e.target.value)}
          required
          placeholder="Ex: Português"
        />
      </div>
      <div className="form-group">
        <label htmlFor="moeda">Moeda *</label>
        <input
          id="moeda"
          type="text"
          value={moeda}
          onChange={(e) => setMoeda(e.target.value)}
          required
          placeholder="Ex: Real"
        />
      </div>
      <div className="form-group">
        <label htmlFor="idContinente">Continente *</label>
        <select
          id="idContinente"
          value={idContinente}
          onChange={(e) => setIdContinente(e.target.value)}
          required
          disabled={isLoadingContinents}
        >
          <option value="">
            {isLoadingContinents ? 'Carregando...' : 'Selecione um continente'}
          </option>
          {continents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-save" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default CountryForm;
