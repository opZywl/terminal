import { UniversalFunction } from "./UniversalFunction";

/**
 * clock – converte um horário base (São Paulo/UTC‑3) para
 *         fusos de países pré‑definidos.
 *
 * usage
 *   clock HH:MM [paises...]      → mostra todos ou filtra países
 *   clock agora|now [paises...]   → usa horário atual de SP
 *   clock --list                  → lista países suportados
 *   clock --help                  → ajuda
 */
export class Clock {
    private uf = new UniversalFunction();
    private cmd: HTMLElement;
    private args: string[];

    /** fusos horários: offset relativo ao UTC em horas */
    private zones: Record<string, { nome: string; offset: number }> = {
        brasil:         { nome: "São Paulo, Brasil",       offset: -3 },
        portugal:       { nome: "Lisboa, Portugal",        offset:  +1 },
        china:          { nome: "Pequim, China",           offset:  8 },
        estadosUnidos:  { nome: "Nova Iorque, EUA",        offset: -4 },
        inglaterra:     { nome: "Londres, Reino Unido",    offset:  +1 },
        espanha:        { nome: "Madri, Espanha",         offset:  2 },
        italia:         { nome: "Roma, Itália",           offset:  2 },
        japao:          { nome: "Tóquio, Japão",          offset:  9 },
        arabia:         { nome: "Riad, Arábia Saudita",   offset:  3 },
        india:          { nome: "Nova Deli, Índia",       offset:  5.5 }
    };

    private baseOffset = -3;

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd  = commandElement;
        this.args = arg.split(/\s+/).filter(Boolean).map(a => a.toLowerCase());
        try {
            this.run();
        } catch (e) {
            this.error("Erro interno: " + (e as Error).message);
        }
    }

    private run(): void {
        if (this.args.length === 0 || this.args[0] === "--help") {
            this.showHelp();
            return;
        }

        if (this.args[0] === "--list") {
            this.showList();
            return;
        }

        let h: number, m: number;
        if (["agora", "now"].includes(this.args[0])) {
            const nowUtcH = new Date().getUTCHours();
            h = (nowUtcH + this.baseOffset + 24) % 24;
            m = new Date().getUTCMinutes();
        } else {
            const timeMatch = this.args[0].match(/^(\d{1,2}):(\d{2})$/);
            if (!timeMatch) {
                this.error("Horário inválido. Use HH:MM, agora ou now.");
                return;
            }
            h = Number(timeMatch[1]);
            m = Number(timeMatch[2]);
            if (h > 23 || m > 59) {
                this.error("Horário fora do intervalo.");
                return;
            }
        }

        const requested = this.args.slice(1);
        const keys = requested.length
            ? requested.filter(k => k in this.zones)
            : Object.keys(this.zones);

        if (keys.length === 0) {
            this.error("Nenhum país reconhecido.");
            return;
        }

        const table = this.buildTable(h, m, keys);
        this.uf.updateElement("div", "output", table, this.cmd);
    }

    private buildTable(h: number, m: number, keys: string[]): string {
        const utcMinutes = (h - this.baseOffset) * 60 + m;
        const th = `<tr><th>Local</th><th>Hora Local</th><th>UTC</th><th>Dif. p/ SP</th></tr>`;

        const rows = keys.map(k => {
            const { nome, offset } = this.zones[k];
            const targetUtcMin = utcMinutes + offset * 60;
            const modMin = ((targetUtcMin % 1440) + 1440) % 1440;
            const localH = Math.floor(modMin / 60);
            const localM = modMin % 60;
            const hh = String(localH).padStart(2, "0");
            const mm = String(localM).padStart(2, "0");

            const sign = offset >= 0 ? "+" : "-";
            const absOffset = Math.abs(offset);
            const offsetH = Math.floor(absOffset);
            const offsetM = (absOffset - offsetH) * 60;
            const utcStr = `${sign}${offsetH}` + (offsetM ? `:${offsetM.toString().padStart(2, "0")}` : "");

            const diff = offset - this.baseOffset;
            const sign2 = diff >= 0 ? "+" : "-";
            const absDiff = Math.abs(diff);
            const diffH = Math.floor(absDiff);
            const diffM = (absDiff - diffH) * 60;
            const diffStr = `${sign2}${diffH}` + (diffM ? `:${diffM.toString().padStart(2, "0")}` : "") + " h";

            return `<tr><td>${nome}</td><td><code>${hh}:${mm}</code></td><td><code>UTC${utcStr}</code></td><td>${diffStr}</td></tr>`;
        }).join("");

        return `<table class="clock"><thead>${th}</thead><tbody>${rows}</tbody></table>`;
    }

    private showHelp(): void {
        const lista = [...new Set(Object.keys(this.zones))].join(", ");
        const msg = `<p>clock: converte um horário de Brazil (UTC${this.baseOffset >= 0 ? "+" : ""}${this.baseOffset}) para outros fusos.</p>
<strong>Uso</strong><br>
&nbsp; clock HH:MM [paises...]<br>
&nbsp; clock agora|now [paises...]<br>
&nbsp; clock --list<br>
&nbsp; clock --help<br><br>
<strong>Países</strong>: ${lista}`;
        this.uf.updateElement("div", "output", msg, this.cmd);
    }

    private showList(): void {
        const lista = [...new Set(Object.entries(this.zones).map(([k, v]) => `${k} (${v.nome})`))].join("<br>");
        this.uf.updateElement("div", "output", `<strong>Países suportados:</strong><br>${lista}`, this.cmd);
    }

    private error(msg: string): void {
        this.uf.updateElement("div", "error", `clock: ${msg}`, this.cmd);
    }
}