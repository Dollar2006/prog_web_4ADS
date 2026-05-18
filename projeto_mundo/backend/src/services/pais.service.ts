import prisma from '../lib/prisma.js';

interface CountryInput {
  nome: string;
  populacao: number | bigint;
  idiomaOficial: string;
  moeda: string;
  idContinente: number;
}

export async function createCountry(data: CountryInput) {
  return await prisma.pais.create({
    data,
  });
}

export async function listCountries() {
  return await prisma.pais.findMany({
    orderBy: {
      nome: 'asc',
    },
    include: {
      continente: true,
    },
  });
}

export async function listCountriesByContinent(idContinente: number) {
  return await prisma.pais.findMany({
    where: {
      idContinente,
    },
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
  return await prisma.pais.update({
    where: { id },
    data,
  });
}

export async function deleteCountry(id: number) {
  return await prisma.pais.delete({
    where: { id },
  });
}
