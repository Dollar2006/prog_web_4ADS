import prisma from '../lib/prisma.js';
import * as paisService from './pais.service.js';

interface CityInput {
  nome: string;
  populacao: number | bigint;
  latitude: number | string;
  longitude: number | string;
  idPais: number;
}

interface CityFilters {
  countryId?: number;
  continentId?: number;
}

export async function listCities(filters: CityFilters = {}) {
  const where: any = {};

  if (filters.countryId) {
    where.idPais = filters.countryId;
  }

  if (filters.continentId) {
    where.pais = {
      idContinente: filters.continentId,
    };
  }

  return await prisma.cidade.findMany({
    where,
    include: {
      pais: {
        include: {
          continente: true,
        },
      },
    },
    orderBy: [
      {
        pais: {
          nome: 'asc',
        },
      },
      {
        nome: 'asc',
      },
    ],
  });
}

export async function getCityById(id: number) {
  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: {
      pais: {
        include: {
          continente: true,
        },
      },
    },
  });

  if (!cidade) {
    throw new Error('Cidade não encontrada');
  }

  return cidade;
}

export async function createCity(data: CityInput) {
  // Validate that country exists
  await paisService.getCountryById(data.idPais);

  return await prisma.cidade.create({
    data: {
      nome: data.nome,
      populacao: typeof data.populacao === 'string' ? BigInt(data.populacao) : BigInt(data.populacao),
      latitude: typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude,
      longitude: typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude,
      idPais: data.idPais,
    },
    include: {
      pais: {
        include: {
          continente: true,
        },
      },
    },
  });
}

export async function updateCity(id: number, data: Partial<CityInput>) {
  // Verify city exists and country exists (if provided) in parallel
  const promises = [getCityById(id)];

  if (data.idPais) {
    promises.push(paisService.getCountryById(data.idPais));
  }

  await Promise.all(promises);

  try {
    return await prisma.cidade.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.populacao !== undefined && {
          populacao:
            typeof data.populacao === 'string' ? BigInt(data.populacao) : BigInt(data.populacao),
        }),
        ...(data.latitude !== undefined && {
          latitude:
            typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude,
        }),
        ...(data.longitude !== undefined && {
          longitude:
            typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude,
        }),
        ...(data.idPais !== undefined && { idPais: data.idPais }),
      },
      include: {
        pais: {
          include: {
            continente: true,
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Cidade não encontrada');
    }
    throw error;
  }
}

export async function deleteCity(id: number) {
  try {
    return await prisma.cidade.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Cidade não encontrada');
    }
    throw error;
  }
}
