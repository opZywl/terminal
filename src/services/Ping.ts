import { UniversalFunction } from "./UniversalFunction";

interface DnsAnswer {
    data: string;
    TTL: number;
}

interface DnsResponse {
    Answer?: DnsAnswer[];
}

export class Ping {
    private options: string;
    private uf: UniversalFunction;
    private commandElement: HTMLElement;

    constructor(options: string, commandElement: HTMLElement) {
        this.options = options.trim();
        this.uf = new UniversalFunction();
        this.commandElement = commandElement;
        this.parseCommand();
    }

    private parseCommand(): void {
        if (!this.options) {
            const errMsg = "ping: missing host argument.<br>Usage: ping <host>";
            this.uf.updateElement("div", "error", errMsg, this.commandElement);
            return;
        }
        const parts = this.options.split(/\s+/);
        if (parts.length > 1) {
            const errMsg = `ping: too many arguments.<br>Usage: ping <host>`;
            this.uf.updateElement("div", "error", errMsg, this.commandElement);
            return;
        }
        const host = parts[0];
        this.pingHost(host);
    }

    private async pingHost(host: string): Promise<void> {
        const hostInfo = await this.resolveHost(host);
        const outputEl = document.createElement("div");
        outputEl.classList.add("output");

        if (!hostInfo) {
            outputEl.innerHTML = `ping: ${host}: Name or service not known`;
            this.commandElement.appendChild(outputEl);
            return;
        }

        const { ip, ttl } = hostInfo;
        const count = 4;

        outputEl.innerHTML = `Disparando ${host} [${ip}] com 32 bytes de dados:`;
        this.commandElement.appendChild(outputEl);

        const times: number[] = [];
        for (let i = 0; i < count; i++) {
            const ms = await this.pingOnce(host);
            times.push(ms);
            const line = document.createElement("div");
            line.innerHTML = `Resposta de ${ip}: bytes=32 tempo=${Math.round(ms)}ms TTL=${ttl}`;
            outputEl.appendChild(line);
            await this.sleep(500);
        }

        const min = Math.round(Math.min(...times));
        const max = Math.round(Math.max(...times));
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

        const stats = document.createElement("div");
        stats.innerHTML = `
Estatísticas do Ping para ${ip}:<br>
    Pacotes: Enviados = ${count}, Recebidos = ${count}, Perdidos = 0 (0% de perda),<br>
Aproximar um número redondo de vezes em milissegundos:<br>
    Mínimo = ${min}ms, Máximo = ${max}ms, Média = ${avg}ms`;
        outputEl.appendChild(stats);
    }

    private pingOnce(host: string): Promise<number> {
        return new Promise(resolve => {
            const img = new Image();
            const start = performance.now();
            const cleanup = () => {
                img.onload = null;
                img.onerror = null;
            };
            img.onload = () => { cleanup(); resolve(performance.now() - start); };
            img.onerror = () => { cleanup(); resolve(performance.now() - start); };
            img.src = `https://${host}/favicon.ico?cache=${Date.now()}`;
        });
    }

    private async resolveHost(host: string): Promise<{ ip: string; ttl: number } | null> {
        try {
            const response = await fetch(`https://dns.google/resolve?name=${host}&type=A`);
            if (!response.ok) return null;
            const data: DnsResponse = await response.json();
            const answer = data.Answer?.[0];
            if (!answer) return null;
            return { ip: answer.data, ttl: answer.TTL };
        } catch {
            return null;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}