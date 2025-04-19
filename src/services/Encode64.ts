import { UniversalFunction } from "./UniversalFunction";

export class Encode64 {
    private static stage: "none" | "input" | "confirm" | "ext" | "size" | "wrap" = "none";
    private static lastEncoded: string = "";
    private static tempExt: string = "";
    private static readonly BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    private static readonly MAX_SAFE_BLOB_SIZE = 4 * 1024 * 1024 * 1024;
    private static readonly RANDOM_PAD_CHUNK_BASE_SIZE = 1024;
    private static randomPadBaseChunk: string | null = null;


    static isAwaiting(): boolean {
        return Encode64.stage !== "none";
    }

    static resetStage(): void {
        console.log("Resetting Encode64 stage.");
        Encode64.stage = "none";
        Encode64.lastEncoded = "";
        Encode64.tempExt = "";
    }

    private static getRandomPadBaseChunk(): string {
        if (!Encode64.randomPadBaseChunk) {
            let chunk = "";
            for (let i = 0; i < Encode64.RANDOM_PAD_CHUNK_BASE_SIZE; i++) {
                chunk += Encode64.BASE64_CHARS[Math.floor(Math.random() * Encode64.BASE64_CHARS.length)];
            }
            Encode64.randomPadBaseChunk = chunk;
        }
        return Encode64.randomPadBaseChunk;
    }

    private uf = new UniversalFunction();
    private readonly cmd: HTMLElement;
    private readonly raw: string;

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd = commandElement;
        this.raw = arg.trim();

        console.log(`Encode64 Init: Stage='${Encode64.stage}', Input='${this.raw.substring(0, 50)}...'`);

        if (Encode64.stage === "none" && this.raw && !this.isFlag(this.raw)) {
            console.log("New command detected, resetting stage.");
            Encode64.resetStage();
        } else if (Encode64.stage !== "none" && this.isFlag(this.raw)) {
            console.log("Flag detected while awaiting input, resetting stage.");
            Encode64.resetStage();
        }
        this.run();
    }

    private isFlag(input: string): boolean {
        return input.startsWith('--help') || input.startsWith('--file');
    }

    private async run(): Promise<void> {
        const [flagCandidate, ...rest] = this.raw.split(/\s+/);
        if (flagCandidate === "--help") {
            Encode64.resetStage();
            this.showHelp();
            return;
        }
        if (flagCandidate === "--file") {
            Encode64.resetStage();
            try {
                this.flagFile(rest);
            } catch (e) {
                this.error(e instanceof Error ? e.message : String(e));
                Encode64.resetStage();
            }
            return;
        }

        try {
            switch (Encode64.stage) {
                case "none":
                    if (!this.raw) {
                        Encode64.stage = "input";
                        this.uf.updateElement("div", "output", "Digite o texto a ser codificado:", this.cmd);
                        return;
                    }
                    this.encodeShowMenu(this.raw);
                    Encode64.stage = "confirm";
                    return;

                case "input":
                    if (!this.raw) {
                        this.error("Nenhum texto fornecido. Operação cancelada.");
                        Encode64.resetStage();
                        return;
                    }
                    this.encodeShowMenu(this.raw);
                    Encode64.stage = "confirm";
                    return;

                case "confirm":
                    this.handleMenu(this.raw);
                    return;

                case "ext":
                    if (!this.raw.trim() || this.raw.toLowerCase() === 'none') {
                        this.uf.updateElement("div", "output", "Download cancelado.", this.cmd);
                        Encode64.resetStage();
                        return;
                    }
                    if (!this.storeExtension(this.raw)) {
                        Encode64.resetStage();
                        return;
                    }
                    Encode64.stage = "size";
                    this.uf.updateElement("div", "output", "Tamanho máximo por arquivo (ex: 500k, 10m, 1.5g, full):", this.cmd);
                    return;

                case "size":
                    if (!this.raw.trim()) {
                        this.error("Nenhum tamanho fornecido. Download cancelado.");
                        Encode64.resetStage();
                        return;
                    }
                    await this.createDownload(this.raw);
                    return;

                case "wrap":
                    if (!this.raw.trim()) {
                        this.error("Nenhum número fornecido para wrap. Operação cancelada.");
                        Encode64.resetStage();
                        return;
                    }
                    this.applyWrap(this.raw);
                    return;
            }
        } catch (error) {
            console.error("Erro inesperado no método run:", error);
            this.error(`Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
            Encode64.resetStage();
        }
    }

    private encodeShowMenu(text: string): void {
        try {
            const encoded = this.toBase64(text);
            if (encoded === null) {
                Encode64.resetStage();
                return;
            }
            Encode64.lastEncoded = encoded;
            const menu = `<br><br>Codificado (${this.formatBytes(encoded.length)}). Opções:
      <strong>d</strong> – Download (pode dividir/preencher)
      <strong>c</strong> – Copiar para clipboard
      <strong>u</strong> – Gerar Data URL
      <strong>w</strong> – Aplicar Wrap (quebra de linha)`;
            this.uf.updateElement("pre", "output", `${encoded}${menu}`, this.cmd);
        } catch (e) {
            this.error(`Falha ao codificar: ${e instanceof Error ? e.message : String(e)}`);
            Encode64.resetStage();
        }
    }

    private handleMenu(choice: string): void {
        const lower = choice.toLowerCase().trim();

        if (!Encode64.lastEncoded && !/^(d|download|y|yes)$/.test(lower)) {
            if (!/^(d|download|y|yes)$/.test(lower)) {
                this.error("Nenhum dado codificado disponível para esta ação.");
                Encode64.resetStage();
                return;
            }
        }

        if (/^(d|download|y|yes)$/.test(lower)) {
            Encode64.stage = "ext";
            this.uf.updateElement("div", "output", "Extensão do arquivo (ex: txt, bin) ou 'none' para cancelar:", this.cmd);
            return;
        }

        if (/^(c|clipboard)$/.test(lower)) {
            if (!Encode64.lastEncoded) {
                this.error("Nada para copiar.");
                Encode64.resetStage(); return;
            }
            navigator.clipboard?.writeText(Encode64.lastEncoded)
                .then(() => this.uf.updateElement("div", "success", "Copiado para a área de transferência.", this.cmd))
                .catch(err => this.error(`Falha ao copiar: ${err.message}. Verifique permissões.`))
                .finally(() => Encode64.resetStage());
            return;
        }

        if (/^(u|url)$/.test(lower)) {
            if (!Encode64.lastEncoded) {
                this.error("Nada para gerar URL.");
                Encode64.resetStage(); return;
            }
            const url = `data:text/plain;base64,${Encode64.lastEncoded}`;
            this.uf.updateElement("pre", "output", url, this.cmd);
            Encode64.resetStage();
            return;
        }

        const inlineWrap = lower.match(/^w(?:rap)?\s+(\d{1,3})$/);
        if (inlineWrap) {
            this.applyWrap(inlineWrap[1]);
            return;
        }

        if (/^w(?:rap)?$/.test(lower)) {
            if (!Encode64.lastEncoded) {
                this.error("Nada para aplicar wrap.");
                Encode64.resetStage(); return;
            }
            Encode64.stage = "wrap";
            this.uf.updateElement("div", "output", "Número de caracteres por linha (4-120):", this.cmd);
            return;
        }

        this.uf.updateElement("div", "output", `Opção inválida: "${choice}". Nenhuma ação.`, this.cmd);
        Encode64.resetStage();
    }

    private storeExtension(extInput: string): boolean {
        const clean = extInput.trim().replace(/^\./, "");
        if (!clean) {
            this.error("Extensão não pode ser vazia. Download cancelado.");
            return false;
        }
        if (!/^[a-z0-9][a-z0-9_-]{0,19}$/i.test(clean)) {
            this.error("Extensão inválida. Use 1-20 letras, números, '-' ou '_'. Comece com letra/número.");
            return false;
        }
        Encode64.tempExt = clean;
        return true;
    }

    private async createDownload(sizeInput: string): Promise<void> {
        const updateFeedback = (message: string): void => {
            this.uf.updateElement("div", "feedback", message, this.cmd);
        };

        updateFeedback("Processando solicitação de download...");
        await this.yield();
        try {
            const maxBytes = this.parseSize(sizeInput.trim());

            if (maxBytes === null) throw new Error("Tamanho inválido. Use números com k, m, g ou 'full'. Ex: 100k, 2m, 1.5g, full.");
            if (maxBytes === 0) throw new Error("Tamanho do arquivo não pode ser zero.");
            if (maxBytes < 0) throw new Error("Tamanho do arquivo não pode ser negativo.");
            if (maxBytes > Encode64.MAX_SAFE_BLOB_SIZE) {
                throw new Error(`Tamanho solicitado (${this.formatBytes(maxBytes)}) excede o limite prático de ${this.formatBytes(Encode64.MAX_SAFE_BLOB_SIZE)}. Escolha um tamanho menor.`);
            }

            const data = Encode64.lastEncoded;
            const totalLength = data.length;

            if (totalLength === 0 && maxBytes === Infinity) {
                throw new Error("Não há dados codificados para gerar arquivo 'full'.");
            }

            const partsToDownload: { name: string; blob: Blob }[] = [];
            const effectiveExt = Encode64.tempExt || 'txt';

            if (maxBytes === Infinity) {
                updateFeedback("Preparando arquivo de tamanho original...");
                await this.yield();
                const blob = new Blob([data], { type: "application/octet-stream" });
                partsToDownload.push({ name: `encoded.${effectiveExt}`, blob });

            } else {
                const numParts = totalLength === 0 ? 1 : Math.ceil(totalLength / maxBytes);
                updateFeedback(`Preparando ${numParts} parte(s) de ${this.formatBytes(maxBytes)} cada...`);
                await this.yield(50);

                for (let i = 0; i < numParts; i++) {
                    const partIndex = i + 1;
                    updateFeedback(`Gerando parte ${partIndex} de ${numParts}...`);
                    await this.yield();

                    const start = i * maxBytes;
                    const dataChunk = data.slice(start, start + maxBytes);
                    const currentChunkLength = dataChunk.length;
                    const paddingNeeded = maxBytes - currentChunkLength;

                    const blobParts: (string | Blob)[] = [];
                    if (currentChunkLength > 0) {
                        blobParts.push(dataChunk);
                    }

                    if (paddingNeeded > 0) {
                        updateFeedback(`Gerando parte ${partIndex}/${numParts}: Preenchendo ${this.formatBytes(paddingNeeded)}...`);
                        await this.yield();

                        let remainingPadding = paddingNeeded;
                        let paddingGenerated = 0;
                        const padBaseChunk = Encode64.getRandomPadBaseChunk();
                        const padBaseLen = padBaseChunk.length;

                        while (remainingPadding > 0) {
                            const numFullChunks = Math.floor(remainingPadding / padBaseLen);
                            if (numFullChunks > 0) {
                                try {
                                    const repeatedChunk = padBaseChunk.repeat(numFullChunks);
                                    blobParts.push(repeatedChunk);
                                    const generated = numFullChunks * padBaseLen;
                                    remainingPadding -= generated;
                                    paddingGenerated += generated;
                                } catch (e) {
                                    console.warn("padBaseChunk.repeat failed, falling back to single chunk addition.");
                                    for(let r=0; r<numFullChunks; r++) {
                                        blobParts.push(padBaseChunk);
                                        const generated = padBaseLen;
                                        remainingPadding -= generated;
                                        paddingGenerated += generated;
                                        if (r % 50 === 0) {
                                            updateFeedback(`Gerando parte ${partIndex}/${numParts}: Preenchendo ${this.formatBytes(paddingGenerated)} / ${this.formatBytes(paddingNeeded)} (Fallback)`);
                                            await this.yield();
                                        }
                                    }
                                }
                            }
                            if (remainingPadding > 0) {
                                let finalRandomChars = "";
                                const count = remainingPadding;
                                for (let j = 0; j < count; j++) {
                                    finalRandomChars += Encode64.BASE64_CHARS[Math.floor(Math.random() * Encode64.BASE64_CHARS.length)];
                                }
                                if(finalRandomChars) blobParts.push(finalRandomChars);
                                paddingGenerated += remainingPadding;
                                remainingPadding = 0;
                            }

                            if (remainingPadding === 0 || paddingGenerated % (5 * 1024 * 1024) < Encode64.RANDOM_PAD_CHUNK_BASE_SIZE) {
                                updateFeedback(`Gerando parte ${partIndex}/${numParts}: Preenchendo ${this.formatBytes(paddingGenerated)} / ${this.formatBytes(paddingNeeded)}`);
                                await this.yield();
                            }
                        }
                    }

                    updateFeedback(`Gerando parte ${partIndex}/${numParts}: Finalizando...`);
                    await this.yield();

                    const blob = new Blob(blobParts, { type: "application/octet-stream" });

                    if (blob.size !== maxBytes) {
                        console.error(`Erro Interno: Parte ${partIndex} gerada com tamanho incorreto! Esperado: ${maxBytes}, Obtido: ${blob.size}`);
                        throw new Error(`Falha ao gerar parte ${partIndex} com o tamanho correto. Esperado: ${maxBytes}, Obtido: ${blob.size}.`);
                    }

                    const suffix = numParts === 1 ? "" : `.part${partIndex}`;
                    const filename = `encoded${suffix}.${effectiveExt}`;
                    partsToDownload.push({ name: filename, blob });

                }
            }
            if (partsToDownload.length === 0) {
                throw new Error("Nenhuma parte foi gerada para download.");
            }

            updateFeedback(`Iniciando download de ${partsToDownload.length} arquivo(s)...`);
            await this.yield(50);

            for (const part of partsToDownload) {
                updateFeedback(`Iniciando download: ${part.name}`);
                try {
                    this.saveAs(part.name, part.blob);
                    await this.yield(100);
                } catch (e) {
                    console.error(`Falha ao iniciar download para ${part.name}:`, e);
                    this.error(`Falha ao salvar ${part.name}. Verifique o console.`);
                }
            }

            const sizeMsg = maxBytes === Infinity ? "Tamanho original." : `Cada parte com ${this.formatBytes(maxBytes)}.`;
            this.uf.updateElement( "div", "success", `Download(s) iniciado(s) para ${partsToDownload.length} arquivo(s). ${sizeMsg}`, this.cmd );

        } catch (error) {
            console.error("Erro durante createDownload:", error);
            this.error(error instanceof Error ? error.message : `Erro desconhecido durante download: ${String(error)}`);
        } finally {
            Encode64.resetStage();
        }
    }

    private applyWrap(lenStr: string): void {
        if (!Encode64.lastEncoded) {
            this.error("Nenhum dado codificado para aplicar wrap.");
            Encode64.resetStage(); return;
        }
        const len = parseInt(lenStr, 10);
        if (isNaN(len) || !Number.isInteger(len) || len < 4 || len > 120) {
            this.error("Wrap inválido. Use um número inteiro entre 4 e 120.");
            Encode64.resetStage();
            return;
        }

        try {
            const wrapped = Encode64.lastEncoded.replace(new RegExp(`(.{${len}})`, "g"), "$1\n");
            const finalWrapped = wrapped.endsWith('\n') ? wrapped.slice(0, -1) : wrapped;
            this.uf.updateElement("pre", "output", finalWrapped, this.cmd);
        } catch (e) {
            this.error(`Erro ao aplicar wrap: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            Encode64.resetStage();
        }
    }

    private parseSize(str: string): number | null {
        str = str.toLowerCase().trim();
        if (!str || str === "full") return Infinity;

        const match = str.match(/^(\d+(?:\.\d+)?)\s*([kmg])?$/);
        if (!match) return null;

        let n = parseFloat(match[1]);
        if (isNaN(n) || n < 0) return null;

        const unit = match[2];
        switch (unit) {
            case "k": n *= 1024; break;
            case "m": n *= 1024 * 1024; break;
            case "g": n *= 1024 * 1024 * 1024; break;
        }
        return Math.round(n);
    }

    private formatBytes(bytes: number, decimals = 2): string {
        if (bytes === Infinity) return 'Tamanho Completo';
        if (!Number.isFinite(bytes) || bytes < 0) return 'Tamanho Inválido';
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        const index = Math.min(i, sizes.length - 1);

        return parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
    }

    private toBase64(text: string): string | null {
        try {
            const bytes = new TextEncoder().encode(text);
            let binaryString = '';
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                binaryString += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunkSize)));
            }
            return btoa(binaryString);
        } catch (e) {
            this.error(`Falha ao converter para Base64: ${e instanceof Error ? e.message : String(e)}`);
            return null;
        }
    }

    private saveAs(name: string, blob: Blob): void {
        let url: string | null = null;
        let a: HTMLAnchorElement | null = null;
        try {
            url = URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            console.log(`Download iniciado para: ${name}, Tamanho: ${this.formatBytes(blob.size)}`);
        } catch (e) {
            console.error("Erro na função saveAs:", e);
            throw new Error(`Falha ao criar link de download para ${name}.`);
        } finally {
            setTimeout(() => {
                if (a) document.body.removeChild(a);
                if (url) URL.revokeObjectURL(url);
            }, 200);
        }
    }

    private flagFile(args: string[]): void {
        if (args.length < 2) {
            throw new Error("Uso incorreto. Ex: encode64 --file <nome.txt> <texto para codificar>");
        }
        const name = args[0];
        const textToEncode = args.slice(1).join(" ");

        if (!name || !/^[\w.-]+$/i.test(name) || name.length > 255 || name === "." || name === "..") {
            throw new Error("Nome de arquivo inválido fornecido para --file.");
        }
        if (!textToEncode) {
            throw new Error("Nenhum texto fornecido para codificar com --file.");
        }

        const encodedContent = this.toBase64(textToEncode);
        if (encodedContent === null) {
            return;
        }

        const blob = new Blob([encodedContent], { type: "application/octet-stream" });
        this.saveAs(name, blob);

        this.uf.updateElement("div", "success", `Arquivo <strong>${name}</strong> (${this.formatBytes(blob.size)}) gerado e download iniciado.`, this.cmd);
    }

    private showHelp(): void {
        const msg = `<strong>encode64</strong> – Codifica/decodifica texto em Base64 com opções interativas.<br><br>
<strong>Uso Interativo:</strong><br>
1. <code>encode64</code>: Pede o texto.<br>
2. Digite o texto e Enter.<br>
3. Escolha uma opção (d, c, u, w) e Enter.<br>
   - <strong>d</strong>: Download (pede extensão e tamanho - ex: 100k, 5m, 1.2g, full).<br>
   - <strong>c</strong>: Copiar Base64.<br>
   - <strong>u</strong>: Gerar Data URL.<br>
   - <strong>w</strong>: Aplicar Wrap (pede nº de caracteres 4-120).<br><br>
<strong>Uso Rápido:</strong><br>
   <code>encode64 "Seu texto aqui"</code> (Codifica e mostra menu)<br><br>
<strong>Flags:</strong><br>
   <code>encode64 --file nome.txt Seu texto aqui</code> (Codifica e salva direto)<br>
   <code>encode64 --help</code> (Mostra esta ajuda)<br><br>
<strong>Notas:</strong><br>
- Tamanhos grandes (MBs/GBs) para download usam padding aleatório e podem levar tempo.<br>
- Cancelamento: 'none' para extensão ou deixar tamanho/wrap vazio cancela a operação atual.`;
        this.uf.updateElement("div", "output", msg, this.cmd);
    }

    private error(msg: string): void {
        console.error("Encode64 Error:", msg);
        this.uf.updateElement("div", "error", `Erro: ${msg}`, this.cmd);
    }

    private yield(ms: number = 0): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}