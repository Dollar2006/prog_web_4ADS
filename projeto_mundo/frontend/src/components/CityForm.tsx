import React, { useState, useEffect } from 'react';
import { cityService, countryService } from '../services/api';

interface City {
  id: number;
  nome: string;
  populacao: number;
  latitude: number;
  longitude: number;
  idPais: number;
}

interface Country {
  id: number;
  nome: string;
  idContinente: number;
}

interface CityFormProps {
  city?: City;
  onSuccess: () => void;
  onClose: () => void;
}

const CityForm: React.FC<CityFormProps> = ({ city, onSuccess, onClose }) => {
  const [nome, setNome] = useState('');
  const [populacao, setPopulacao] = useState('');
  const [idPais, setIdPais] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingCity, setIsValidatingCity] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await countryService.getCountries();
        setCountries(data);
      } catch (err) {
        setErrors({ general: 'Erro ao carregar países' });
      } finally {
        setIsLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (city) {
      setNome(city.nome);
      setPopulacao(city.populacao.toString());
      setIdPais(city.idPais.toString());
    }
  }, [city]);

  const handleAutoCorrectCity = async () => {
    if (!nome.trim()) return;

    setIsValidatingCity(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/cities/validate?nome=${encodeURIComponent(nome)}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.cidade) {
          setNome(data.cidade); // Auto-corrige a grafia (Ex: "sao paulo" -> "São Paulo")
          setErrors((prev) => {
            const { nome: _, ...rest } = prev;
            return rest;
          });
        }
      } else {
        setErrors((prev) => ({ ...prev, nome: 'Cidade não encontrada na API do clima' }));
      }
    } catch (err) {
      console.warn('Erro ao auto-corrigir cidade pelo backend', err);
    } finally {
      setIsValidatingCity(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) {
      newErrors.nome = 'Nome da cidade é obrigatório';
    }

    if (!populacao) {
      newErrors.populacao = 'População é obrigatória';
    } else {
      const pop = parseInt(populacao);
      if (isNaN(pop) || pop < 0) {
        newErrors.populacao = 'População deve ser um número não negativo';
      }
    }

    if (!idPais) {
      newErrors.idPais = 'País é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = {
        nome: nome.trim(),
        populacao: parseInt(populacao),
        idPais: parseInt(idPais),
      };

      if (city?.id) {
        await cityService.updateCity(city.id, data);
      } else {
        await cityService.createCity(data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrors({ general: err.response?.data?.error || 'Erro ao salvar cidade' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="form-group">
        <label htmlFor="nome">Nome da Cidade *</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onBlur={handleAutoCorrectCity}
          placeholder="Ex: lisboa"
          className={errors.nome ? 'input-error' : ''}
          disabled={isSubmitting}
        />
        {isValidatingCity && <span className="loading-text-subtle" style={{ fontSize: '12px', color: '#666' }}> Verificando...</span>}
        {errors.nome && <span className="error-text">{errors.nome}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="populacao">População *</label>
        <input
          id="populacao"
          type="number"
          value={populacao}
          onChange={(e) => setPopulacao(e.target.value)}
          placeholder="Ex: 500000"
          className={errors.populacao ? 'input-error' : ''}
          disabled={isSubmitting}
        />
        {errors.populacao && <span className="error-text">{errors.populacao}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="idPais">País *</label>
        <select
          id="idPais"
          value={idPais}
          onChange={(e) => setIdPais(e.target.value)}
          disabled={isLoadingCountries || isSubmitting}
          className={errors.idPais ? 'input-error' : ''}
        >
          <option value="">
            {isLoadingCountries ? 'Carregando...' : 'Selecione um país'}
          </option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {errors.idPais && <span className="error-text">{errors.idPais}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting || isValidatingCity}>
          {isSubmitting ? 'Salvando...' : city ? 'Atualizar' : 'Criar'}
        </button>
        <button type="button" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CityForm;