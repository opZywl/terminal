import { UniversalFunction } from "./UniversalFunction";

export class Contact {
    private uf: UniversalFunction;

    constructor() {
        this.uf = new UniversalFunction();
    }

    toString(): string {
        return `
<p class="two-col">
  <span class='keyword'>Portfolio</span>
  <span><a href="https://lucas-lima.vercel.app/" target="_blank">Portfolio</a></span>

  <span class='keyword'>Email</span>
  <span><a href="mailto:lucas.user.xyz@gmail.com">lucas.user.xyz@gmail.com</a></span>

  <span class='keyword'>Telegram</span>
  <span><a href="https://t.me/opzywl" target="_blank">@opzywl</a></span>
  
  <span class='keyword'>GitHub</span>
  <span><a href="https://github.com/opZywl" target="_blank">github.com/opzywl</a></span>
    
  <span class='keyword'>LinkedIn</span>
  <span><a href="https://www.linkedin.com/in/lucsp-lima" target="_blank">linkedin.com/in/lucsp-lima/</a></span>
    
  <span class='keyword'>Instagram</span>
  <span><a href="https://www.instagram.com/lucsp.lima/" target="_blank">instagram.com/lucsp.lima</a></span>
    
  <span class='keyword'>Discord</span>
  <span><a href="https://discord.gg/WV6qPzyqTx" target="_blank">Comunidade</a></span>
  
</p>
`;
    }

    updateDOM(): void {
        this.uf.updateElement("div", "output", this.toString());
    }
}