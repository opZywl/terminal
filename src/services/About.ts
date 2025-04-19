import { UniversalFunction } from "./UniversalFunction";

export class About {
    private uf: UniversalFunction;

    constructor() {
        this.uf = new UniversalFunction();
    }

    toString(): string {
        return `
<p>
  Olá! Meu nome é Lucas, sou estudante do <b>UNASP</b> e estou cursando <b>Sistemas de Informação</b>. Venho me dedicando ao meu desenvolvimento pessoal e profissional.
</p>
<p>
  Tenho um grande apreço por leitura e por explorar meu mundo introspectivo. Também tenho ótimo estilo musical:
</p>
<iframe
  style="border-radius:12px"
  src="https://open.spotify.com/embed/playlist/5OFd7qBY4Ggu659JsCEI65?si=915a200632844200"
  width="100%"
  height="152"
  frameBorder="0"
  allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
></iframe>
`;
    }

    updateDOM(): void {
        this.uf.updateElement("div", "output", this.toString());
    }
}