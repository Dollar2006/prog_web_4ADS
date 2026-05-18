import prisma from '../lib/prisma.js';

export async function createContinent(data: { nome: string; descricao: string }) {
  return await prisma.continente.create({
    data,
  });
}

export async function listContinents() {
  return await prisma.continente.findMany({
    orderBy: {
      nome: 'asc',
    },
  });
}

export async function getContinentById(id: number) {
  const continente = await prisma.continente.findUnique({
    where: { id },
  });

  if (!continente) {
    throw new Error('Continente não encontrado');
  }

  return continente;
}

export async function updateContinent(id: number, data: { nome: string; descricao: string }) {
  return await prisma.continente.update({
    where: { id },
    data,
  });
}

export async function deleteContinent(id: number) {
  return await prisma.continente.delete({
    where: { id },
  });
}
