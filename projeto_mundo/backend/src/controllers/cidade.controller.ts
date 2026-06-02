import { Request, Response } from 'express';
import * as cidadeService from '../services/cidade.service.js';

function validateLatitude(latitude: any): boolean {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

function validateLongitude(longitude: any): boolean {
  const lon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  return !isNaN(lon) && lon >= -180 && lon <= 180;
}

export async function createCity(req: Request, res: Response) {
  try {
    const { nome, populacao, latitude, longitude, idPais } = req.body;

    // Validation
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

    if (latitude === undefined || latitude === null || latitude === '') {
      return res.status(400).json({ error: 'Latitude é obrigatória' });
    }

    if (!validateLatitude(latitude)) {
      return res.status(400).json({ error: 'Latitude deve estar entre -90 e 90' });
    }

    if (longitude === undefined || longitude === null || longitude === '') {
      return res.status(400).json({ error: 'Longitude é obrigatória' });
    }

    if (!validateLongitude(longitude)) {
      return res.status(400).json({ error: 'Longitude deve estar entre -180 e 180' });
    }

    if (!idPais) {
      return res.status(400).json({ error: 'ID do país é obrigatório' });
    }

    const result = await cidadeService.createCity({
      nome,
      populacao: pop,
      latitude,
      longitude,
      idPais: Number(idPais),
    });

    const responseData = {
      ...result,
      populacao: Number(result.populacao),
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };

    return res.status(201).json(responseData);
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

    const responseData = result.map((c) => ({
      ...c,
      populacao: Number(c.populacao),
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
    }));

    return res.status(200).json(responseData);
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

    const responseData = {
      ...result,
      populacao: Number(result.populacao),
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };

    return res.status(200).json(responseData);
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

    const { nome, populacao, latitude, longitude, idPais } = req.body;

    // Validation - only validate fields that are being updated
    if (nome !== undefined && (nome === null || nome === '')) {
      return res.status(400).json({ error: 'Nome da cidade é obrigatório' });
    }

    if (populacao !== undefined && populacao !== null) {
      const pop = typeof populacao === 'string' ? parseInt(populacao, 10) : populacao;
      if (isNaN(pop) || pop < 0) {
        return res.status(400).json({ error: 'População deve ser um número não negativo' });
      }
    }

    if (latitude !== undefined && latitude !== null) {
      if (!validateLatitude(latitude)) {
        return res.status(400).json({ error: 'Latitude deve estar entre -90 e 90' });
      }
    }

    if (longitude !== undefined && longitude !== null) {
      if (!validateLongitude(longitude)) {
        return res.status(400).json({ error: 'Longitude deve estar entre -180 e 180' });
      }
    }

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (populacao !== undefined) updateData.populacao = populacao;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (idPais !== undefined) updateData.idPais = idPais;

    const result = await cidadeService.updateCity(id, updateData);

    const responseData = {
      ...result,
      populacao: Number(result.populacao),
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    };

    return res.status(200).json(responseData);
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
