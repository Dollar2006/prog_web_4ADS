import { Request, Response } from 'express';
import * as cidadeService from '../services/cidade.service.js';
import * as paisService from '../services/pais.service.js';
import { fetchWeatherByCityName } from '../services/openWeather.service.js'; // Serviço isolado no backend

export async function createCity(req: Request, res: Response) {
  try {
    // Agora o req.body recebe APENAS nome, populacao e idPais vindos do formulário
    const { nome, populacao, idPais } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome da cidade é obrigatório' });
    }

    if (populacao === undefined || populacao === null || populacao === '') {
      return res.status(400).json({ error: 'População é obrigatória' });
    }

    const pop = typeof populacao === 'string' ? parseInt(populacao, 10) : populacao;
    if (isNaN(pop) || pop < 0) {
      return res.status(400).json({ error: 'População deve ser um número não negativo' });
    }

    if (!idPais) {
      return res.status(400).json({ error: 'ID do país é obrigatório' });
    }

    // 1. Validar se o país existe
    const pais = await paisService.getCountryById(Number(idPais));
    if (!pais) {
      return res.status(400).json({ error: 'País não encontrado' });
    }

    // 2. Chamar a API externa pelo Backend para obter a Latitude, Longitude e a grafia correta
    const dadosExternos = await fetchWeatherByCityName(nome);
    if (!dadosExternos) {
      return res.status(400).json({ 
        error: 'Não foi possível obter a geolocalização e dados climáticos para esta cidade no OpenWeather.' 
      });
    }

    // 3. Persistir no banco com os dados injetados automaticamente
    const result = await cidadeService.createCity({
      nome: dadosExternos.cidade, // Salva o nome com a grafia oficial corrigida pela API
      populacao: pop,
      latitude: dadosExternos.latitude,   // Injetado automaticamente
      longitude: dadosExternos.longitude, // Injetado automaticamente
      idPais: Number(idPais),
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'País não encontrado') {
      return res.status(400).json({ error: 'País não encontrado' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function listCities(req: Request, res: Response) {
  try {
    const { countryId, continentId } = req.query;

    const filters: any = {};
    if (countryId) {
      filters.countryId = Number(countryId);
    }
    if (continentId) {
      filters.continentId = Number(continentId);
    }

    const result = await cidadeService.listCities(filters);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function getCityById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await cidadeService.getCityById(id);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Cidade não encontrada') {
      return res.status(404).json({ error: 'Cidade não encontrada' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function updateCity(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { nome, populacao, idPais } = req.body;

    if (nome !== undefined && (nome === null || nome.trim() === '')) {
      return res.status(400).json({ error: 'Nome da cidade é obrigatório' });
    }

    const updateData: any = {};
    if (populacao !== undefined && populacao !== null) {
      const pop = typeof populacao === 'string' ? parseInt(populacao, 10) : populacao;
      if (isNaN(pop) || pop < 0) {
        return res.status(400).json({ error: 'População deve ser um número não negativo' });
      }
      updateData.populacao = pop;
    }

    if (idPais !== undefined) updateData.idPais = Number(idPais);

    // Se o utilizador atualizou o nome da cidade, recalculamos a lat/lon dinamicamente
    if (nome) {
      const dadosExternos = await fetchWeatherByCityName(nome);
      if (dadosExternos) {
        updateData.nome = dadosExternos.cidade;
        updateData.latitude = dadosExternos.latitude;
        updateData.longitude = dadosExternos.longitude;
      } else {
        return res.status(400).json({ 
          error: 'Não foi possível atualizar a cidade pois o novo nome não retornou coordenadas válidas.' 
        });
      }
    }

    const result = await cidadeService.updateCity(id, updateData);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Cidade não encontrada') {
      return res.status(404).json({ error: 'Cidade não encontrada' });
    }
    if (error.message === 'País não encontrado') {
      return res.status(400).json({ error: 'País não encontrado' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function validateCity(req: Request, res: Response) {
  try {
    const { nome } = req.query;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome da cidade é obrigatório' });
    }

    // Chama o serviço OpenWeather para validar e obter a grafia corrigida
    const dadosExternos = await fetchWeatherByCityName(nome);
    if (!dadosExternos) {
      return res.status(404).json({ 
        error: 'Cidade não encontrada na API OpenWeather.' 
      });
    }

    return res.status(200).json({
      cidade: dadosExternos.cidade,
      latitude: dadosExternos.latitude,
      longitude: dadosExternos.longitude,
      temperatura: dadosExternos.temperatura,
      descricao: dadosExternos.descricao
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao validar cidade' });
  }
}

export async function deleteCity(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await cidadeService.deleteCity(id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Cidade não encontrada') {
      return res.status(404).json({ error: 'Cidade não encontrada' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}