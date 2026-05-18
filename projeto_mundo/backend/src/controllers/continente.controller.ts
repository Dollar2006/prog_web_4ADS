import { Request, Response } from 'express';
import * as continenteService from '../services/continente.service.js';

export async function createContinent(req: Request, res: Response) {
  try {
    const { nome, descricao } = req.body;
    const result = await continenteService.createContinent({ nome, descricao });
    return res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(404).json({ error: 'Continente não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function listContinents(req: Request, res: Response) {
  try {
    const result = await continenteService.listContinents();
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(404).json({ error: 'Continente não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function getContinentById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await continenteService.getContinentById(id);
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(404).json({ error: 'Continente não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function updateContinent(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome, descricao } = req.body;
    const result = await continenteService.updateContinent(id, { nome, descricao });
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(404).json({ error: 'Continente não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export async function deleteContinent(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    await continenteService.deleteContinent(id);
    return res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Continente não encontrado') {
      return res.status(404).json({ error: 'Continente não encontrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
