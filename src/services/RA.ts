import { UniversalFunction } from "./UniversalFunction";
import { getRAData, RAEntry } from "./RAData";

export class RA {
    private static waitingPass = false;
    private static waitingCode = false;
    private static fails       = 0;
    static isAwaiting(): boolean { return RA.waitingPass || RA.waitingCode; }

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

    private uf  = new UniversalFunction();
    private readonly cmd: HTMLElement;

    constructor(arg: string, cmd: HTMLElement) {
        this.cmd = cmd;
        this.handle(arg.trim());
    }

    private handle(input: string): void {
        if (!RA.waitingPass && !RA.waitingCode) {
            RA.waitingPass = true;
            this.uf.updateElement("div", "output",
                "Digite a senha para acessar o RA:", this.cmd);
            return;
        }

        if (RA.waitingPass) {
            RA.waitingPass = false;

            if (input === this.PASS) {
                RA.fails = 0;
                RA.waitingCode = true;
                this.uf.updateElement("div", "output",
                    "Senha aceita. Insira o código:", this.cmd);
                return;
            }

            RA.fails++;
            this.uf.updateElement("div", "error",
                "Senha incorreta, você não tem acesso.", this.cmd);

            const idx = Math.min(RA.fails - 1, this.redirects.length - 1);
            setTimeout(() => {
                this.redirects[idx].forEach((url, i) =>
                    window.open(url, `_blank_${Date.now()}_${i}`));
            }, 3000);
            return;
        }

        if (RA.waitingCode) {
            RA.waitingCode = false;

            if (!input.startsWith("1337")) {
                this.uf.updateElement("div", "error",
                    "Código inválido.", this.cmd);
                RA.waitingCode = true;
                return;
            }

            const b64 = input.slice(4);
            let url: string;
            try {
                url = atob(b64);
                if (!/^https?:\/\//i.test(url)) throw new Error();
            } catch {
                this.uf.updateElement("div", "error",
                    "Código inválido.", this.cmd);
                RA.waitingCode = true;
                return;
            }

            this.uf.updateElement("div", "output",
                "Carregando dados…", this.cmd);

            getRAData(url).then((data) => {
                this.uf.updateElement("div", "output",
                    this.buildTable(data), this.cmd);
            }).catch(() => {
                this.uf.updateElement("div", "error",
                    "Erro ao obter dados.", this.cmd);
                RA.waitingCode = true;
            });
        }
    }

    private buildTable(data: RAEntry[]): string {
        return `<table>
      <thead>
        <tr><th>Nome</th><th>RA</th><th>PASS</th>
            <th>Token</th><th>Note</th></tr>
      </thead>
      <tbody>
        ${data.map((e) => `
          <tr>
            <td>${e.nome}</td><td>${e.RA}</td><td>${e.PASS}</td>
            <td>${e.token}</td><td>${e.note ?? ""}</td>
          </tr>`).join("")}
      </tbody>
    </table>`;
    }
}