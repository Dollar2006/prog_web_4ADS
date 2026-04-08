import { Filmes } from "./filmes";
import Table = require("cli-table3");
import chalk = require("chalk");

export class Catalogo {
    filmes: Filmes[] = []
    private proximoId: number = 1;

    adicionarFilme(filme: Filmes) {
        filme.id = this.proximoId++;
        this.filmes.push(filme);
    }

    listarFilmes() {
        if (this.filmes.length === 0) {
            console.log(chalk.yellow("\n[!] O catálogo está vazio.\n"));
            return;
        }

        const table = new Table({
            head: [
                chalk.cyan('ID'), 
                chalk.cyan('TÍTULO'), 
                chalk.cyan('ANO'), 
                chalk.cyan('GÊNERO'), 
                chalk.cyan('AVAL.')
            ],
            colWidths: [5, 30, 8, 20, 10],
            style: { head: [], border: [] }
        });

        this.filmes.forEach(f => {
            table.push([
                f.id,
                chalk.white(f.titulo),
                f.ano,
                f.genero,
                chalk.green(f.avaliacao + "/10")
            ]);
        });

        console.log("\n" + chalk.bold.magenta("🎬 LISTAGEM DE FILMES 🎬"));
        console.log(table.toString() + "\n");
    }

    removerFilme(identificador: string | number): boolean {
        const index = this.filmes.findIndex(f => 
            f.id === Number(identificador) || f.titulo.toLowerCase() === identificador.toString().toLowerCase()
        );
        
        if (index !== -1) {
            this.filmes.splice(index, 1);
            return true;
        }
        return false;
    }

    buscarFilme(identificador: string | number) {
        return this.filmes.find(f => 
            f.id === Number(identificador) || f.titulo.toLowerCase() === identificador.toString().toLowerCase()
        );
    }
}