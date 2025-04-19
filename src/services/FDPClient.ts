import { UniversalFunction } from "./UniversalFunction";

/**
 * fdpclient – lista versões do FDPClient e contagem de downloads a partir dos releases GitHub.
 *
 * usage
 *   fdpclient → busca e mostra todas as versões disponíveis, além de links rápidos
 */
export class FDPClient {
    private uf = new UniversalFunction();
    private readonly cmd: HTMLElement;
    private readonly apiURL = "https://api.github.com/repos/SkidderMC/FDPClient/releases";

    private readonly links = {
        GitHub:    "https://github.com/SkidderMC/FDPClient",
        Website:   "https://fdpinfo.github.io/next/",
        Downloads: "https://fdpinfo.github.io/download",
        Discord:   "https://discord.gg/WV6qPzyqTx",
        Setup:     "https://youtu.be/eNFtxER0oD8"
    };

    constructor(arg: string, commandElement: HTMLElement) {
        this.cmd = commandElement;
        this.run();
    }

    private run(): void {
        const header = this.buildHeader();
        this.uf.updateElement("div", "output", header + "<p>Carregando versões do FDPClient...</p>", this.cmd);

        fetch(this.apiURL)
            .then(res => {
                if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
                return res.json();
            })
            .then((releases: Array<{ tag_name: string; html_url: string; assets: Array<{ download_count: number }> }>) => {
                const listHtml = this.buildList(releases);
                this.uf.updateElement("div", "output", header + listHtml, this.cmd);
            })
            .catch(err => {
                this.uf.updateElement("div", "error", `fdpclient: erro ao obter releases: ${err.message}`, this.cmd);
            });
    }

    private buildHeader(): string {
        const buttons = Object.entries(this.links)
            .map(([label, url]) =>
                `<button class="btn" onclick="window.open('${url}', '_blank')">${label}</button>`
            ).join(" ");

        return `
            <div class="fdp-header" style="text-align:center; margin-bottom:1em;">
                ${buttons}
            </div>
        `;
    }

    private buildList(releases: Array<{ tag_name: string; html_url: string; assets: Array<{ download_count: number }> }>): string {
        if (!Array.isArray(releases) || releases.length === 0) {
            return `<p>Nenhuma release encontrada.</p>`;
        }

        const items = releases.map(rel => {
            const tag = rel.tag_name;
            const url = rel.html_url;
            const downloadCount = rel.assets
                .reduce((sum: number, asset: { download_count: number }) => sum + (asset.download_count || 0), 0);

            return `
                <div class="fdp-item">
                    <span><strong>${tag}</strong> Download Count: ${downloadCount}</span>
                    <button class="btn" onclick="window.open('${url}', '_blank')">Changelog</button>
                </div>
            `;
        }).join("");

        return `<div class="fdp-list">${items}</div>`;
    }
}