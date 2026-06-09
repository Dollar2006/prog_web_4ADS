import { Request, Response } from 'express';
import * as paisService from '../services/pais.service.js';

export async function createCountry(req: Request, res: Response) {
  try {
    const { nome, populacao, idiomaOficial, moeda, idContinente } = req.body;
    const result = await paisService.createCountry({
      nome,
      populacao: typeof populacao === 'string' ? parseInt(populacao) : populacao,
      idiomaOficial,
      moeda,
      idContinente: Number(idContinente),
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(400).json({ error: 'Continente não encontrado' });
    }
    if (error.message === 'País não encontrado') {
      return res.status(404).json({ error: 'País não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function listCountries(req: Request, res: Response) {
  try {
    const { continentId } = req.query;
    const result = await paisService.listCountries(continentId ? Number(continentId) : undefined);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'País não encontrado') {
      return res.status(404).json({ error: 'País não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function getCountryById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const result = await paisService.getCountryById(id);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'País não encontrado') {
      return res.status(404).json({ error: 'País não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function updateCountry(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const { nome, populacao, idiomaOficial, moeda, idContinente } = req.body;
    const result = await paisService.updateCountry(id, {
      nome,
      populacao: typeof populacao === 'string' ? parseInt(populacao) : populacao,
      idiomaOficial,
      moeda,
      idContinente: idContinente ? Number(idContinente) : undefined,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(400).json({ error: 'Continente não encontrado' });
    }
    if (error.message === 'País não encontrado') {
      return res.status(404).json({ error: 'País não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function deleteCountry(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    await paisService.deleteCountry(id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.message === 'País não encontrado') {
      return res.status(404).json({ error: 'País não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
