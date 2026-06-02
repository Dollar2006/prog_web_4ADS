import React, { useState, useEffect } from 'react';
import { continentService } from '../services/api';

interface ContinentFormProps {
  continent?: { id: number; nome: string; descricao: string | null };
  onSuccess: () => void;
  onClose: () => void;
}

const ContinentForm: React.FC<ContinentFormProps> = ({ continent, onSuccess, onClose }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (continent) {
      setNome(continent.nome);
      setDescricao(continent.descricao || '');
    }
  }, [continent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      if (continent?.id) {
        await continentService.updateContinent(continent.id, { nome, descricao });
      } else {
        await continentService.createContinent({ nome, descricao });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar continente');
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
          placeholder="Ex: América do Sul"
        />
      </div>
      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição do continente..."
        />
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

export default ContinentForm;
