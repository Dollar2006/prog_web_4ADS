import prisma from '../lib/prisma.js';

export async function createContinent(data: { nome: string; descricao?: string }) {
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

export async function updateContinent(id: number, data: { nome: string; descricao?: string }) {
  try {
    return await prisma.continente.update({
      where: { id },
      data,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Continente não encontrado');
    }
    throw error;
  }
}

export async function deleteContinent(id: number) {
  try {
    return await prisma.continente.delete({
      where: { id },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Continente não encontrado');
    }
    throw error;
  }
}

export async function getDashboardStats() {
  const [
    totalContinentes,
    totalPaises,
    totalCidades,
    continenteMaisPaises,
    ultimosRegistros,
  ] = await Promise.all([
    prisma.continente.count(),
    prisma.pais.count(),
    prisma.cidade.count(),
    prisma.pais.groupBy({
      by: ['idContinente'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    }),
    Promise.all([
      prisma.continente.findMany({
        orderBy: {
          criadoEm: 'desc',
        },
        take: 3,
      }),
      prisma.pais.findMany({
        orderBy: {
          criadoEm: 'desc',
        },
        take: 3,
        include: {
          continente: true,
        },
      }),
      prisma.cidade.findMany({
        orderBy: {
          criadoEm: 'desc',
        },
        take: 3,
        include: {
          pais: {
            include: {
              continente: true,
            },
          },
        },
      }),
    ]),
  ]);

  let continenteMaisPaisesData: any = null;
  if (continenteMaisPaises.length > 0) {
    const continent = await prisma.continente.findUnique({
      where: { id: continenteMaisPaises[0].idContinente },
    });
    continenteMaisPaisesData = {
      nome: continent?.nome || 'N/A',
      totalPaises: continenteMaisPaises[0]._count.id,
    };
  }

  const [recentContinents, recentCountries, recentCities] = ultimosRegistros;

  const recentCountriesFormatted = recentCountries.map((p) => ({
    ...p,
    populacao: Number(p.populacao),
  }));

  const recentCitiesFormatted = recentCities.map((c) => ({
    ...c,
    populacao: Number(c.populacao),
    pais: {
      ...c.pais,
      populacao: Number(c.pais.populacao),
    },
  }));

  return {
    totalContinentes,
    totalPaises,
    totalCidades,
    continenteMaisPaises: continenteMaisPaisesData,
    ultimosRegistros: {
      continentes: recentContinents,
      paises: recentCountriesFormatted,
      cidades: recentCitiesFormatted,
    },
  };
}
