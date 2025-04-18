export class UniversalFunction {
    /**
     * Cria (ou atualiza) um elemento dentro do último bloco `.command`.
     *
     * @param tag    Tag do elemento (ex.: 'div')
     * @param classes  Classe(s) – string separada por espaços ou array
     * @param html     Conteúdo HTML
     * @param cmdEl    Bloco `.command` alvo (opcional)
     */
    updateElement(
        tag: string,
        classes: string | string[] = '',
        html: string = '',
        cmdEl?: HTMLElement
    ): void {
        let container: HTMLElement | undefined = cmdEl;
        if (!container) {
            const cmdList = document.getElementsByClassName('command');
            if (cmdList.length === 0) {
                console.error('Nenhum bloco .command encontrado.');
                return;
            }
            container = cmdList.item(cmdList.length - 1) as HTMLElement;
        }

        const classArr = Array.isArray(classes)
            ? classes
            : classes.trim().split(/\s+/);

        let target = Array.from(container.children).find((child) => {
            const el = child as HTMLElement;
            return (
                el.classList.length === classArr.length &&
                classArr.every((c) => el.classList.contains(c))
            );
        }) as HTMLElement | undefined;

        if (target) {
            target.innerHTML = html;
        } else {
            target = document.createElement(tag);
            target.classList.add(...classArr);
            target.innerHTML = html;
            container.appendChild(target);
        }
    }
}
