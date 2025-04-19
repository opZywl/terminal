import { UniversalFunction } from "./UniversalFunction";

/**
 * pages – lista URLs pré-definidas com botões para acessar ou copiar o link.
 *
 * usage
 *   pages → mostra todas as páginas disponíveis
 */
export class Pages {
    private uf = new UniversalFunction();
    private readonly cmd: HTMLElement;

    /** chave: rótulo, valor: URL */
    private pages: Record<string, string> = {
        "Brightspace Adventistas":  "https://adventistas.brightspace.com/",
        "Portal do Aluno UNASP": "https://aluno-ies.educadventista.org/FrameHTML/Web/App/Edu/PortalEducacional/login/?_gl=1*cads6z*_gcl_au*NzczNDIwODk3LjE3NDUwNzcxOTk.*FPAU*NzczNDIwODk3LjE3NDUwNzcxOTk.*_ga*NjE3NDgzNTUuMTc0NTA3NzE5OQ..*_ga_TT3ECPVC9E*MTc0NTA3NzE5OC4xLjAuMTc0NTA3NzIwMS4wLjAuNTY4MDQwMzA5*_fplc*cW9VV0kzanVQODBRblo3YXFjME9BUGk4Q1NGbCUyRk5HeHBVc3pKb1ZZSThraklibXFEQU5NVkwxYlE4a01GQVVENHolMkYxeU82SzJBbGZaRU9BVzhjUnIwdWlaNUN4MGg0TGR5alF0UlhlUDFiUUJLU0ZHQk9RWXc5NTgxYWw2USUzRCUzRA..",
        "Portfolio": "https://www.lucas-lima.xyz/",
    };

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd = commandElement;
        this.run();
    }

    private run(): void {
        const keys = Object.keys(this.pages);
        const list = this.buildList(keys);
        this.uf.updateElement("div", "output", list, this.cmd);
    }

    private buildList(keys: string[]): string {
        const items = keys.map(key => {
            const url = this.pages[key];
            return `
        <div class="page-item">
          <span class="label">${key}</span>
          <button class="btn" onclick="window.open('${url}', '_blank')">Acessar</button>
          <button class="btn" onclick="navigator.clipboard.writeText('${url}')">Copiar</button>
        </div>
      `;
        }).join("");

        return `<div class="pages-list">${items}</div>`;
    }
}