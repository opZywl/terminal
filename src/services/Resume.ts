import { UniversalFunction } from './UniversalFunction';

declare global {
    interface Window {
        html2pdf: any;
    }
}

export class Resume {
    private options: string;
    private uf: UniversalFunction;
    private commandElement: HTMLElement;
    private commands: Record<string, (value?: string) => void>;

    constructor(options: string = '', commandElement: HTMLElement) {
        this.options = options.trim();
        this.uf = new UniversalFunction();
        this.commandElement = commandElement;
        this.commands = {
            '--download': this.handleDownload.bind(this),
            '--help':    this.handleHelp.bind(this),
        };
        this.execute();
    }

    private execute(): void {
        const args = this.options.split(/\s+/).filter(Boolean);
        if (args.length === 0) {
            this.displayResume();
            return;
        }
        if (args.length > 2) {
            this.displayError('too many arguments.');
            return;
        }
        const [command, value] = args;
        const action = this.commands[command];
        if (!action) {
            this.displayError(`'${command}' is not a valid argument.`);
            return;
        }
        action(value);
    }

    private displayError(message: string): void {
        this.uf.updateElement(
            'div',
            'output-error',
            `resume: ${message}<br>type <em>resume --help</em> for help.`,
            this.commandElement
        );
    }

    private async handleDownload(format: string = 'pdf'): Promise<void> {
        const map: Record<string, string> = { pdf: 'curriculo-Lucas.pdf', doc: 'Lucas.docx' };
        const fileName = map[format];
        if (!fileName) {
            this.displayError(`'${format}' is not a valid format.`);
            return;
        }
        this.uf.updateElement(
            'div',
            'output-download',
            `<p>Generating <strong>${fileName}</strong>&hellip;</p>`,
            this.commandElement
        );
        try {
            await this.generateResume(format, fileName);
        } catch (err: any) {
            this.displayError(err.message);
        }
    }

    private async generateResume(format: string, fileName: string): Promise<void> {
        const html = this.getHTML();
        if (format === 'pdf') {
            const src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            await this.loadScript(src);
            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, { width: '210mm', padding: '0', visibility: 'hidden' });
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
            await window.html2pdf()
                .from(wrapper)
                .set({ filename: fileName, margin: 10,
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } })
                .save();
            document.body.removeChild(wrapper);
        } else {
            const blob = new Blob([this.toDocHTML(html)], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            this.forceDownload(url, fileName);
            URL.revokeObjectURL(url);
        }
    }

    private handleHelp(): void {
        const helpText = `
<p>resume: Displays or downloads my resume.</p>
<p>usage: resume [option] [value]</p>
<ul>
  <li><strong>--download [pdf | doc]</strong> generate &amp; download resume (default = pdf).</li>
  <li><strong>--help</strong> show this help message.</li>
</ul>`;
        this.uf.updateElement('div', 'output-help', helpText, this.commandElement);
    }

    private forceDownload(url: string, fileName: string): void {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    private loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src;
            script.onload  = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    private getHTML(): string {
        return this.getHeader() + this.getEducation() + this.getPortfolio() + this.getSkills();
    }

    private toDocHTML(innerHTML: string): string {
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"></head>
<body>${innerHTML}</body>
</html>`;
    }

    private getHeader(): string {
        return `
<div class="header">
  <h1>Lucas Lima</h1><hr>
  <p>
    <a href="tel:+5519971580092">+55(19)97158‑0092</a> |
    <a href="mailto:lucas.user.xyz@gmail.com">lucas.user.xyz@gmail.com</a> |
    <a href="https://lucas-lima.vercel.app/" target="_blank">CLI‑Portfolio</a> |
    <a href="https://github.com/opZywl" target="_blank">GitHub</a> |
    <a href="https://www.linkedin.com/in/lucsp-lima" target="_blank">LinkedIn</a>
  </p><hr>
</div>`;
    }

    private getEducation(): string {
        return `
<div class="education">
  <h2>FORMAÇÃO</h2><hr>
  <div class="education-item" style="display:flex;justify-content:space-between;">
    <div>
      <strong>UNASP</strong><br>
      <span>Sistemas de Informação</span><br>
      <span>Ênfase: Software Developer, Cibersegurança, DevOps, Web Dev</span>
    </div>
    <div style="text-align:right;">
      <span>Hortolândia, São Paulo</span><br>
      <span>Fev 2022 – presente</span>
    </div>
  </div><br>
  <div class="education-item" style="display:flex;justify-content:space-between;">
    <div>
      <strong>WECAN</strong><br>
      <span>Língua Inglesa e Literaturas de Língua Inglesa</span>
    </div>
    <div style="text-align:right;">
      <span>Hortolândia, São Paulo</span><br>
      <span>Jun 2023 – presente</span>
    </div>
  </div>
</div>`;
    }

    private getPortfolio(): string {
        return `
<div class="projects">
  <h2>PORTFÓLIO</h2><hr>
  <div class="projects-item">
    <strong>Página → <a href="https://lucas-lima.vercel.app/" target="_blank">GitHub</a></strong>
    <ul><li>Descubra meus projetos, minha trajetória e como me contatar.</li></ul>
  </div>
</div>`;
    }

    private getSkills(): string {
        return `
<div class="skills">
  <h2>HABILIDADES TÉCNICAS</h2><hr>
  <ul>
    <li><strong>Linguagens:</strong> Kotlin, Java, PHP, Rust, JavaScript, Python, TypeScript</li>
    <li><strong>Frameworks & Bibliotecas:</strong> React, Spring Boot, Next.js, Tailwind, Styled‑Components, Express</li>
    <li><strong>Bancos de dados:</strong> MongoDB, MySQL, PostgreSQL</li>
    <li><strong>Ferramentas:</strong> Git, GitHub, Docker, Gradle, Maven</li>
    <li><strong>Cloud:</strong> AWS</li>
    <li><strong>Sistemas Operacionais:</strong> Linux, Windows</li>
  </ul>
</div>`;
    }

    private displayResume(): void {
        this.uf.updateElement('div', 'output-resume', this.getHTML(), this.commandElement);
        this.uf.updateElement(
            'div',
            'output-help',
            `<p>Use <em>resume --download [pdf|doc]</em> to generate and download the resume.</p>`,
            this.commandElement
        );
    }
}