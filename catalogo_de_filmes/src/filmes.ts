export type EscalaAvaliacao = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Filmes = {
    id?: number;
    titulo: string;
    ano: number;
    genero: string;
    duracao: number;
    avaliacao: EscalaAvaliacao;
}



