import prisma from '../lib/prisma.js';
import * as continenteService from './continente.service.js';

interface CountryInput {
  nome?: string;
  populacao?: number | bigint;
  idiomaOficial?: string;
  moeda?: string;
  idContinente?: number;
}

export async function createCountry(data: CountryInput) {
  if (!data.idContinente) {
    throw new Error('ID do continente é obrigatório');
  }

  await continenteService.getContinentById(data.idContinente);

  return await prisma.pais.create({
    data: {
      ...data,
      populacao: data.populacao ? BigInt(data.populacao) : undefined,
    },
  });
}

export async function listCountries(continentId?: number) {
  const where = continentId ? { idContinente: continentId } : {};
  
  return await prisma.pais.findMany({
    where,
    orderBy: {
      nome: 'asc',
    },
    include: {
      continente: true,
    },
  });
}

export async function getCountryById(id: number) {
  const pais = await prisma.pais.findUnique({
    where: { id },
    include: {
      continente: true,
    },
  });

  if (!pais) {
    throw new Error('País não encontrado');
  }

  return pais;
}

export async function updateCountry(id: number, data: CountryInput) {
  if (data.idContinente) {
    await continenteService.getContinentById(data.idContinente);
  }

  try {
    return await prisma.pais.update({
      where: { id },
      data: {
        ...data,
        populacao: data.populacao ? BigInt(data.populacao) : undefined,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('País não encontrado');
    }
    throw error;
  }
}

export async function deleteCountry(id: number) {
  try {
    return await prisma.pais.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('País não encontrado');
    }
    throw error;
  }
}
