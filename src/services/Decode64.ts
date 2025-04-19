import { UniversalFunction } from "./UniversalFunction";

export class Decode64 {
    private static stage: "none" | "awaiting_input" = "none";
    private static lastResult: string | null = null;

    static isAwaiting(): boolean {
        return Decode64.stage === "awaiting_input";
    }

    static resetStage(): void {
        console.log("Resetting Decode64 stage.");
        Decode64.stage = "none";
        Decode64.lastResult = null;
    }

    private uf = new UniversalFunction();
    private readonly cmd: HTMLElement;
    private readonly rawArg: string;

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd = commandElement;
        this.rawArg = arg.trim();

        if (Decode64.isAwaiting() && this.rawArg) {
            console.log("New input provided while awaiting, resetting stage.");
            Decode64.resetStage();
        } else if (Decode64.stage === "none" && this.rawArg.startsWith('--')) {
            Decode64.resetStage();
        }

        this.run();
    }

    private run(): void {
        if (Decode64.stage === "none" && this.rawArg === "") {
            Decode64.stage = "awaiting_input";
            this.uf.updateElement("div", "output", "Digite o texto Base64 a ser decodificado:", this.cmd);
            return;
        }

        if (Decode64.stage === "awaiting_input") {
            const input = this.rawArg;
            Decode64.resetStage();
            if (!input) {
                this.error("Nenhuma entrada fornecida. Operação cancelada.");
                return;
            }
            this.handleDecode(input);
            return;
        }

        const args = this.rawArg.split(/\s+/);
        const flag = args[0];

        if (flag === "--help") {
            this.showHelp();
            Decode64.resetStage();
            return;
        }

        if (flag === "--encode") {
            const textToEncode = this.rawArg.substring(flag.length).trim();
            this.handleEncode(textToEncode);
            Decode64.resetStage();
            return;
        }

        if (flag === "--file") {
            if (args.length < 3) {
                this.error("Uso incorreto. Exemplo: decode64 --file <nome_arquivo.ext> <dados_base64>");
                Decode64.resetStage();
                return;
            }
            const filename = args[1];
            const base64Data = this.rawArg.substring(flag.length + filename.length + 2).trim();
            this.handleSaveFile(filename, base64Data);
            Decode64.resetStage();
            return;
        }

        this.handleDecode(this.rawArg);
        Decode64.resetStage();
    }

    private handleEncode(text: string): void {
        if (!text) {
            this.error("Nenhum texto fornecido para codificar.");
            return;
        }
        try {
            const bytes = new TextEncoder().encode(text);
            let binaryString = '';
            bytes.forEach((byte) => {
                binaryString += String.fromCharCode(byte);
            });
            const encoded = btoa(binaryString);
            Decode64.lastResult = encoded;
            this.displayResult(`Texto codificado:`, encoded, true);

        } catch (e) {
            console.error("Erro ao codificar:", e);
            this.error(`Falha ao codificar: ${e instanceof Error ? e.message : String(e)}`);
        }
    }

    private handleDecode(base64Input: string): void {
        if (!base64Input) {
            this.error("Nenhuma entrada Base64 fornecida para decodificar.");
            return;
        }

        const cleanedB64 = base64Input.replace(/\s/g, '');

        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedB64)) {
            this.error("Entrada contém caracteres inválidos para Base64.");
            return;
        }
        if (cleanedB64.length % 4 !== 0) {
            this.error("Comprimento da entrada Base64 inválido (não é múltiplo de 4).");
            return;
        }

        try {
            const binaryString = atob(cleanedB64);

            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            try {
                const decodedText = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
                Decode64.lastResult = decodedText;
                this.displayResult(`Texto decodificado (UTF-8):`, decodedText, true);

            } catch (utfError) {
                console.warn("Falha ao decodificar como UTF-8:", utfError);
                Decode64.lastResult = null;
                let hexRepresentation = '';
                bytes.forEach((byte, index) => {
                    hexRepresentation += byte.toString(16).padStart(2, '0');
                    if ((index + 1) % 16 === 0) hexRepresentation += '\n';
                    else if ((index + 1) % 2 === 0) hexRepresentation += ' ';
                });
                const outputMsg = `Decodificado, mas não é UTF-8 válido. Conteúdo binário (Hex):\n<pre>${hexRepresentation.trim()}</pre>`;
                this.uf.updateElement("div", "output", outputMsg, this.cmd);
            }

        } catch (e) {
            console.error("Erro ao decodificar Base64:", e);
            if (e instanceof DOMException && e.name === 'InvalidCharacterError') {
                this.error("Erro: A string Base64 fornecida é inválida ou mal formatada (erro em atob).");
            } else {
                this.error(`Falha ao decodificar: ${e instanceof Error ? e.message : String(e)}`);
            }
        }
    }

    private handleSaveFile(filename: string, base64Data: string): void {
        if (!filename || !/^[^\s/\\:*?"<>|]+$/.test(filename) || filename.length > 255 || filename === "." || filename === "..") {
            this.error(`Nome de arquivo inválido: "${filename}". Evite caracteres especiais e mantenha-o curto.`);
            return;
        }
        if (!base64Data) {
            this.error("Nenhum dado Base64 fornecido para salvar no arquivo.");
            return;
        }

        const cleanedB64 = base64Data.replace(/\s/g, '');
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedB64) || cleanedB64.length % 4 !== 0) {
            this.error("Dados Base64 fornecidos para o arquivo são inválidos.");
            return;
        }


        try {
            const binaryString = atob(cleanedB64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: "application/octet-stream" });

            this.saveAs(filename, blob);

            this.uf.updateElement("div", "success", `Download do arquivo <strong>${filename}</strong> (${this.formatBytes(blob.size)}) iniciado.`, this.cmd);

        } catch (e) {
            console.error("Erro ao salvar arquivo de Base64:", e);
            if (e instanceof DOMException && e.name === 'InvalidCharacterError') {
                this.error("Erro: Os dados Base64 fornecidos são inválidos (erro em atob). Não foi possível gerar o arquivo.");
            } else {
                this.error(`Falha ao gerar arquivo: ${e instanceof Error ? e.message : String(e)}`);
            }
        }
    }

    private displayResult(title: string, content: string, allowCopy: boolean): void {
        const maxLen = 1000;
        const truncated = content.length > maxLen;
        const displayContent = truncated ? content.slice(0, maxLen) + `…\n\n(Resultado truncado em ${maxLen} caracteres)` : content;

        let html = `<div class="output-title">${title}</div>`;
        html += `<pre>${this.escapeHtml(displayContent)}</pre>`;

        if (allowCopy && Decode64.lastResult) {
            html += `<button class="copy-button" data-clipboard-text="${this.escapeHtml(Decode64.lastResult)}">Copiar Resultado Completo</button>`;
        }
        if (truncated && Decode64.lastResult) {
            html += ` <span class="info">(Total: ${this.formatBytes(Decode64.lastResult.length)} caracteres)</span>`;
        } else if (Decode64.lastResult) {
            html += ` <span class="info">(${this.formatBytes(Decode64.lastResult.length)} caracteres)</span>`;
        }


        this.uf.updateElement("div", "output", html, this.cmd);

        const copyButton = this.cmd.querySelector('.copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', (event) => {
                const textToCopy = (event.target as HTMLElement).getAttribute('data-clipboard-text');
                if (textToCopy) {
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => {
                            console.log("Resultado copiado para a área de transferência.");
                        })
                        .catch(err => {
                            console.error("Falha ao copiar para clipboard:", err)
                            this.error("Não foi possível copiar. Verifique as permissões do navegador.");
                        });
                }
            });
        }
    }

    private escapeHtml(unsafe: string): string {
        if (!unsafe) return "";
        return unsafe
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "")
            .replace(/'/g, "'")
    }


    private showHelp(): void {
        const msg = `<strong>decode64</strong> – Decodifica e codifica dados em Base64.<br><br>
<strong>Uso:</strong><br>
  <code>decode64</code> (sem argumentos)<br>
    ↳ Solicita interativamente a entrada Base64 para decodificar.<br><br>
  <code>decode64 <dados_base64></code><br>
    ↳ Decodifica os <dados_base64> fornecidos diretamente.<br>
    ↳ Tenta interpretar o resultado como texto UTF-8.<br>
    ↳ Se não for UTF-8 válido, mostra representação hexadecimal.<br><br>
<strong>Flags:</strong><br>
  <code>decode64 --encode <texto_plano></code><br>
    ↳ Codifica o <texto_plano> fornecido para Base64 (usando UTF-8).<br><br>
  <code>decode64 --file <nome_arquivo.ext> <dados_base64></code><br>
    ↳ Decodifica os <dados_base64> e inicia o download de um arquivo binário com o <nome_arquivo.ext> especificado.<br><br>
  <code>decode64 --help</code><br>
    ↳ Mostra esta mensagem de ajuda.<br><br>
<strong>Notas:</strong><br>
- A entrada Base64 é limpa (espaços e quebras de linha são removidos) antes do processamento.<br>
- Validações básicas são feitas na entrada Base64.<br>
- Oferece opção de copiar o resultado (codificado ou decodificado como UTF-8).`;
        this.uf.updateElement("div", "output", msg, this.cmd);
    }

    private error(msg: string): void {
        console.error("Decode64 Error:", msg);
        this.uf.updateElement("div", "error", `Erro (decode64): ${msg}`, this.cmd);
        Decode64.resetStage();
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
            console.log(`Download iniciado para: ${name}, Tamanho: ${this.formatBytes(blob.size)}, Tipo: ${blob.type}`);
        } catch (e) {
            console.error("Erro na função saveAs:", e);
            throw new Error(`Falha ao criar link de download para ${name}. Verifique permissões ou suporte do navegador.`);
        } finally {
            setTimeout(() => {
                if (a) document.body.removeChild(a);
                if (url) URL.revokeObjectURL(url);
            }, 200);
        }
    }

    private formatBytes(bytes: number, decimals = 2): string {
        if (!Number.isFinite(bytes) || bytes < 0) return 'Tamanho Inválido';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const index = Math.min(i, sizes.length - 1);
        return parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
    }
}