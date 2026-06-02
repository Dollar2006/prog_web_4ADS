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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [idPais, setIdPais] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setLatitude(parseFloat(city.latitude.toString()).toString());
      setLongitude(parseFloat(city.longitude.toString()).toString());
      setIdPais(city.idPais.toString());
    }
  }, [city]);

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

    if (!latitude) {
      newErrors.latitude = 'Latitude é obrigatória';
    } else {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude deve estar entre -90 e 90';
      }
    }

    if (!longitude) {
      newErrors.longitude = 'Longitude é obrigatória';
    } else {
      const lon = parseFloat(longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        newErrors.longitude = 'Longitude deve estar entre -180 e 180';
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        nome,
        populacao: parseInt(populacao),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
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
        <label htmlFor="nome">Nome *</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: São Paulo"
          className={errors.nome ? 'input-error' : ''}
        />
        {errors.nome && <span className="error-text">{errors.nome}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="populacao">População *</label>
        <input
          id="populacao"
          type="number"
          value={populacao}
          onChange={(e) => setPopulacao(e.target.value)}
          placeholder="Ex: 12000000"
          className={errors.populacao ? 'input-error' : ''}
        />
        {errors.populacao && <span className="error-text">{errors.populacao}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="latitude">Latitude *</label>
        <input
          id="latitude"
          type="number"
          step="0.000001"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Ex: -23.5505"
          className={errors.latitude ? 'input-error' : ''}
        />
        {errors.latitude && <span className="error-text">{errors.latitude}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="longitude">Longitude *</label>
        <input
          id="longitude"
          type="number"
          step="0.000001"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Ex: -46.6333"
          className={errors.longitude ? 'input-error' : ''}
        />
        {errors.longitude && <span className="error-text">{errors.longitude}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="idPais">País *</label>
        <select
          id="idPais"
          value={idPais}
          onChange={(e) => setIdPais(e.target.value)}
          disabled={isLoadingCountries}
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
        <button type="submit" disabled={isSubmitting}>
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
