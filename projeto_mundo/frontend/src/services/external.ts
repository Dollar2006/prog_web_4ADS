// ============================================================
// INTERFACES
// ============================================================

export interface WeatherData {
  temperatura: number;
  descricao: string;
  icone: string;
  cidade: string;
  latitude: number;
  longitude: number;
}

export interface CountryData {
  nomeOficial: string;
  bandeira: string;
  moeda: string;
  idioma: string;
  regiao: string;
}

export interface NewsItem {
  titulo: string;
  fonte: string;
  url: string;
  publicadoEm: string;
  descricao: string;
}

// ============================================================
// CACHE EM MEMÓRIA
// Evita requisições repetidas para os mesmos dados na sessão
// ============================================================

const weatherCache = new Map<string, WeatherData>();
const countryCache = new Map<string, CountryData>();
const newsCache    = new Map<string, NewsItem[]>();

// ============================================================
// CLIMA VIA BACKEND (Substitui o consumo direto da API Externa)
// ============================================================

export async function fetchWeatherByCityName(
  nomeCidade: string
): Promise<WeatherData | null> {
  const key = nomeCidade.toLowerCase().trim();

  if (weatherCache.has(key)) return weatherCache.get(key)!;

  try {
    // Consome a rota segura que criaste no teu Backend Express
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/cities/validate?nome=${encodeURIComponent(nomeCidade)}`);
    
    if (!res.ok) return null;

    const data = await res.json();
    
    // Mapeia a resposta vinda do backend para a interface que o Modal espera
    const result: WeatherData = {
      temperatura: data.temperatura,
      descricao: data.descricao,
      icone: data.icone || data.icon || '',
      cidade: data.cidade,
      latitude: data.latitude,
      longitude: data.longitude
    };

    weatherCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

// ============================================================
// REST COUNTRIES
// ============================================================

export async function fetchCountryData(
  nome: string
): Promise<CountryData | null> {
  const key = nome.toLowerCase();

  if (countryCache.has(key)) return countryCache.get(key)!;

  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(nome)}`
              + `?fields=name,currencies,languages,flags,region`;

    const res  = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const item = data[0];

    const result: CountryData = {
      nomeOficial: item.name.official,
      bandeira:    item.flags.svg,
      moeda:       Object.values<any>(item.currencies)[0]?.name ?? '—',
      idioma:      Object.values<any>(item.languages)[0]        ?? '—',
      regiao:      item.region,
    };

    countryCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

// ============================================================
// GNEWS
// ============================================================

export async function fetchCountryNews(
  nomePais: string
): Promise<NewsItem[] | null> {
  const key = nomePais.toLowerCase();

  if (newsCache.has(key)) return newsCache.get(key)!;

  const apiKey = import.meta.env.VITE_NEWSAPI_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q',    nomePais);
    url.searchParams.set('lang', 'pt');
    url.searchParams.set('max',  '5');
    url.searchParams.set('token', apiKey);

    const res  = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();

    const result: NewsItem[] = data.articles.map((a: any) => ({
      titulo:      a.title,
      fonte:       a.source.name,
      url:         a.url,
      publicadoEm: a.publishedAt,
      descricao:   a.description ?? '',
    }));

    newsCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

// ============================================================
// FUNÇÃO PRINCIPAL — busca tudo em paralelo
// ============================================================

export async function fetchAllExternalData(cidadeNome: string, paisNome: string) {
  const weather = await fetchWeatherByCityName(cidadeNome);
  
  const [country, news] = await Promise.all([
    fetchCountryData(paisNome),
    fetchCountryNews(paisNome),
  ]);

  return { weather, country, news };
}