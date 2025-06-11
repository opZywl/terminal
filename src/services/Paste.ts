import { UniversalFunction } from "./UniversalFunction";

export class Paste {
    static isAwaiting(): boolean {
        return false;
    }

    private readonly ENCODED_WEBHOOK_URL =
        "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTM4MjUwMDEyNzY2MjUzODg4NS92Rld0T2pKa2l6dUIwU3paQ2ZxWWtWMUpVaEhxc0NFZTEyNEE4WjhlSGVidnhmTWczV0REcWc4QmstNmdUaDAzUVJnSQ==";

    private get webhookUrl(): string {
        try {
            return atob(this.ENCODED_WEBHOOK_URL);
        } catch (e) {
            console.error("Erro ao decodificar a URL do webhook:", e);
            throw new Error("Falha ao decodificar a URL do webhook.");
        }
    }

    private readonly CHUNK_SIZE = 1900;
    private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
    private readonly TIMEOUT_MS = 10_000;

    private uf: UniversalFunction;
    private readonly cmd: HTMLElement;
    private readonly content: string;

    constructor(arg: string, cmd: HTMLElement) {
        this.uf      = new UniversalFunction();
        this.cmd     = cmd;
        this.content = (arg ?? "").trim();
        this.run();
    }

    private async run(): Promise<void> {
        if (this.content.toLowerCase() === "file") {
            return this.selectAndSendFiles();
        }

        if (!this.content) {
            return this.showUsage();
        }

        const chunks = this.splitIntoChunks(this.content);
        if (chunks.length > 1) {
            this.showOutput(`⏳ Texto grande detectado: serão ${chunks.length} partes.`);
        }
        const tasks = chunks.map((part, i) => {
            const label = `Parte ${i + 1}/${chunks.length}`;
            return this.postChunk(part, label);
        });
        await Promise.allSettled(tasks);
    }

    private selectAndSendFiles(): void {
        const input = document.createElement("input");
        input.type     = "file";
        input.multiple = true;
        input.onchange = async () => {
            const files = Array.from(input.files || []);
            if (files.length === 0) {
                this.showError("❌ Nenhum arquivo selecionado.");
                return;
            }

            const uploadTasks: Promise<void>[] = files.map(file =>
                file.size <= this.MAX_FILE_SIZE
                    ? this.postFile(file)
                    : this.postLargeFileInChunks(file)
            );
            await Promise.allSettled(uploadTasks);
        };
        input.click();
    }

    private showUsage(): void {
        this.uf.updateElement(
            "div", "error",
            `Uso correto:
             <strong>paste &lt;texto&gt;</strong> — envia texto ao Discord; ou
             <strong>paste file</strong> — seleciona e envia arquivos (até 10MB).`,
            this.cmd
        );
    }

    private showOutput(html: string): void {
        this.uf.updateElement("div", "output", html, this.cmd);
    }

    private showError(html: string): void {
        this.uf.updateElement("div", "error", html, this.cmd);
    }

    private splitIntoChunks(text: string): string[] {
        const chunks: string[] = [];
        for (let start = 0; start < text.length; start += this.CHUNK_SIZE) {
            chunks.push(text.slice(start, start + this.CHUNK_SIZE));
        }
        return chunks;
    }

    private async postChunk(part: string, label: string): Promise<void> {
        this.showOutput(`⏳ ${label}: enviando…`);
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

        try {
            const resp = await fetch(this.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: part }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                let details = "";
                try {
                    details = JSON.stringify(await resp.json(), null, 2);
                } catch {
                    details = await resp.text();
                }
                this.showError(
                    `❌ ${label} falhou: ${resp.status} ${resp.statusText}` +
                    (details ? `<pre>${details}</pre>` : "")
                );
                return;
            }
            this.showOutput(`✅ ${label} enviada com sucesso.`);
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.message.includes("Falha ao decodificar")) {
                this.showError(`❌ ${label} erro: ${err.message}`);
            } else if ((err as DOMException).name === "AbortError") {
                this.showError(`❌ ${label} timeout após ${this.TIMEOUT_MS}ms.`);
            } else {
                this.showError(`❌ ${label} erro: ${(err as Error).message}`);
            }
        }
    }

    private async postFile(file: File): Promise<void> {
        this.showOutput(`⏳ Enviando arquivo "${file.name}" (${(file.size/1024/1024).toFixed(2)}MB)…`);
        const form       = new FormData();
        form.append("file", file, file.name);

        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

        try {
            const resp = await fetch(this.webhookUrl, {
                method: "POST",
                body: form,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                let details = "";
                try {
                    details = JSON.stringify(await resp.json(), null, 2);
                } catch {
                    details = await resp.text();
                }
                this.showError(
                    `❌ Falha ao enviar "${file.name}": ${resp.status} ${resp.statusText}` +
                    (details ? `<pre>${details}</pre>` : "")
                );
                return;
            }
            this.showOutput(`✅ Arquivo "${file.name}" enviado com sucesso.`);
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.message.includes("Falha ao decodificar")) {
                this.showError(`❌ Erro no envio de "${file.name}": ${err.message}`);
            } else if ((err as DOMException).name === "AbortError") {
                this.showError(`❌ Envio de "${file.name}" timeout após ${this.TIMEOUT_MS}ms.`);
            } else {
                this.showError(`❌ Erro no envio de "${file.name}": ${(err as Error).message}`);
            }
        }
    }


    private async postLargeFileInChunks(file: File): Promise<void> {
        const partSize   = this.MAX_FILE_SIZE;
        const totalParts = Math.ceil(file.size / partSize);

        this.showOutput(`⏳ "${file.name}" excede 10MB. Enviando em ${totalParts} partes...`);

        for (let i = 0; i < totalParts; i++) {
            const start      = i * partSize;
            const end        = Math.min(start + partSize, file.size);
            const chunkBlob  = file.slice(start, end);
            const partNumber = i + 1;
            const label      = `"${file.name}" parte ${partNumber}/${totalParts}`;
            const chunkFile  = new File([chunkBlob], `${file.name}.parte${partNumber}`, { type: file.type });

            await this.postFile(chunkFile);
        }
    }
}
