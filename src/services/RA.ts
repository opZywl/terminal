import { UniversalFunction } from "./UniversalFunction";
import { RAData, RAEntry } from "./RAData";

export class RA {
    private static awaiting = false;
    private static fails = 0;
    static isAwaiting(): boolean { return RA.awaiting; }

    private readonly PASS = "0000";
    private readonly redirects: string[][] = [
        ["https://www.lucas-lima.xyz/"],
        ["https://github.com/opZywl", "https://www.lucas-lima.xyz/"],
        [
            "https://www.linkedin.com/in/lucsp-lima",
            "https://github.com/opZywl",
            "https://www.lucas-lima.xyz/"
        ]
    ];

    private uf = new UniversalFunction();
    private cmd: HTMLElement;

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd = commandElement;
        this.handle(arg.trim());
    }

    private handle(input: string): void {
        if (!RA.awaiting) {
            RA.awaiting = true;
            this.uf.updateElement("div", "output", "Digite a senha para acessar o RA:", this.cmd);
            return;
        }

        RA.awaiting = false;
        if (input === this.PASS) {
            RA.fails = 0;
            this.uf.updateElement("div", "output", this.buildTable(), this.cmd);
            return;
        }

        RA.fails++;
        this.uf.updateElement("div", "error", "Senha incorreta, você não tem acesso.", this.cmd);

        const idx = Math.min(RA.fails - 1, this.redirects.length - 1);
        setTimeout(() => {
            this.redirects[idx].forEach((url, i) => {
                window.open(url, `_blank_${Date.now()}_${i}`);
            });
        }, 3000);
    }

    private buildTable(): string {
        const rows = RAData.map((e: RAEntry) => `
      <tr>
        <td>${e.nome}</td><td>${e.RA}</td><td>${e.PASS}</td><td>${e.token}</td><td>${e.note ?? ""}</td>
      </tr>`).join("");

        return `<table>
      <thead><tr><th>Nome</th><th>RA</th><th>PASS</th><th>Token</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
    }
}
