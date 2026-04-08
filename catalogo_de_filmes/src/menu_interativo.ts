import { Catalogo } from "./catalogo_filme";
import { EscalaAvaliacao } from "./filmes";
import PromptSync from "prompt-sync";
import chalk = require("chalk");
const Table = require("cli-table3");
const boxen = require("boxen");
const gradient = require("gradient-string");
const figlet = require("figlet");
const clear = require("clear-console");

const prompt = PromptSync();

export function menuInterativo() {
    const catalogo = new Catalogo();
    let opcao: string;

    do {
        clear();
        
        // Título estilizado com Figlet e Gradiente
        const title = figlet.textSync("CINE CATALOG", { font: 'Slant' });
        console.log(gradient.pastel.multiline(title));
        
        const menuContent = `
${chalk.cyan(" 1. 🎬 Adicionar novo filme")}
${chalk.cyan(" 2. 📋 Listar catálogo completo")}
${chalk.cyan(" 3. 🗑️  Remover filme")}
${chalk.cyan(" 4. 🔍 Buscar por título/ID")}
${chalk.red(" 5. 🚪 Sair do sistema")}
        `;

        console.log(boxen(menuContent, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'magenta',
            title: chalk.bold.white(' MENU PRINCIPAL '),
            titleAlignment: 'center'
        }));

        opcao = prompt(chalk.bold.yellow(" ➤ Escolha uma ação: ")) || "";

        switch (opcao) {
            case "1":
                console.log(chalk.magenta.bold("\n--- 📝 NOVO FILME ---"));
                const titulo = prompt(chalk.white(" Título: ")) || "";
                const ano = Number(prompt(chalk.white(" Ano de lançamento: ")) || "");
                const genero = prompt(chalk.white(" Gênero: ")) || "";
                const duracao = Number(prompt(chalk.white(" Duração (min): ")) || "");
                const avaliacao = Number(prompt(chalk.white(" Avaliação (0-10): ")) || "") as EscalaAvaliacao;
                
                catalogo.adicionarFilme({ titulo, ano, genero, duracao, avaliacao });
                console.log(chalk.green.bold("\n ✔ Filme adicionado com sucesso!\n"));
                prompt(chalk.gray("Pressione Enter para voltar..."));
                break;

            case "2":
                catalogo.listarFilmes();
                prompt(chalk.gray("Pressione Enter para voltar..."));
                break;

            case "3":
                console.log(chalk.red.bold("\n--- 🗑️  REMOVER FILME ---"));
                const idOuTituloRemover = prompt(chalk.white(" Digite o ID ou Nome do filme: ")) || "";
                if (catalogo.removerFilme(idOuTituloRemover)) {
                    console.log(chalk.green.bold("\n ✔ Filme removido com sucesso!\n"));
                } else {
                    console.log(chalk.red.bold("\n ✘ Filme não encontrado.\n"));
                }
                prompt(chalk.gray("Pressione Enter para voltar..."));
                break;

            case "4":
                console.log(chalk.blue.bold("\n--- 🔍 BUSCA ---"));
                const idOuTituloBuscar = prompt(chalk.white(" Digite o ID ou Nome: ")) || "";
                const filme = catalogo.buscarFilme(idOuTituloBuscar);
                
                if (filme) {
                    const table = new Table({
                        head: [
                            chalk.cyan('ID'), 
                            chalk.cyan('TÍTULO'), 
                            chalk.cyan('ANO'), 
                            chalk.cyan('GÊNERO'), 
                            chalk.cyan('AVAL.')
                        ],
                        colWidths: [6, 30, 8, 20, 10],
                        style: { head: [], border: [] }
                    });

                    table.push([
                        faintColor(filme.id),
                        chalk.bold.white(filme.titulo),
                        filme.ano,
                        filme.genero,
                        chalk.green(filme.avaliacao + "/10")
                    ]);

                    console.log("\n" + chalk.bold.cyan(" RESULTADO ENCONTRADO:"));
                    console.log(table.toString() + "\n");
                } else {
                    console.log(chalk.red.bold("\n ✘ Filme não encontrado.\n"));
                }
                prompt(chalk.gray("Pressione Enter para continuar..."));
                break;

            case "5":
                console.log(gradient.atlas("\n  Até a próxima! Saindo do sistema...\n"));
                break;

            default:
                console.log(chalk.bgRed.white.bold("\n OPÇÃO INVÁLIDA! \n"));
                prompt(chalk.gray("Pressione Enter para tentar novamente..."));
        }
    } while (opcao !== "5");
}

function faintColor(val: any) {
    return chalk.gray(val);
}