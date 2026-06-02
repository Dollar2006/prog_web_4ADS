import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const continentService = {
  async getContinents() {
    const response = await api.get('/continents');
    return response.data;
  },
  async getContinentById(id: number) {
    const response = await api.get(`/continents/${id}`);
    return response.data;
  },
  async createContinent(data: { nome: string; descricao?: string }) {
    const response = await api.post('/continents', data);
    return response.data;
  },
  async updateContinent(id: number, data: { nome: string; descricao?: string }) {
    const response = await api.put(`/continents/${id}`, data);
    return response.data;
  },
  async deleteContinent(id: number) {
    await api.delete(`/continents/${id}`);
  },
  async getDashboardStats() {
    const response = await api.get('/continents/stats');
    return response.data;
  },
};

export const countryService = {
  async getCountries(continentId?: number) {
    const response = await api.get('/countries', {
      params: { continentId },
    });
    return response.data;
  },
  async getCountryById(id: number) {
    const response = await api.get(`/countries/${id}`);
    return response.data;
  },
  async createCountry(data: {
    nome: string;
    populacao: number;
    idiomaOficial: string;
    moeda: string;
    idContinente: number;
  }) {
    const response = await api.post('/countries', data);
    return response.data;
  },
  async updateCountry(id: number, data: Partial<{
    nome: string;
    populacao: number;
    idiomaOficial: string;
    moeda: string;
    idContinente: number;
  }>) {
    const response = await api.put(`/countries/${id}`, data);
    return response.data;
  },
  async deleteCountry(id: number) {
    await api.delete(`/countries/${id}`);
  },
};

export const cityService = {
  async getCities(filters?: { countryId?: number; continentId?: number }) {
    const response = await api.get('/cities', {
      params: filters,
    });
    return response.data;
  },
  async getCityById(id: number) {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  },
  async createCity(data: {
    nome: string;
    populacao: number;
    latitude: number | string;
    longitude: number | string;
    idPais: number;
  }) {
    const response = await api.post('/cities', data);
    return response.data;
  },
  async updateCity(id: number, data: Partial<{
    nome: string;
    populacao: number;
    latitude: number | string;
    longitude: number | string;
    idPais: number;
  }>) {
    const response = await api.put(`/cities/${id}`, data);
    return response.data;
  },
  async deleteCity(id: number) {
    await api.delete(`/cities/${id}`);
  },
};

export const healthService = {
  async checkHealth() {
    try {
      const response = await api.get('/../../health');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};

export default api;
