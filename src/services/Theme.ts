import { UniversalFunction } from "./UniversalFunction";

export class Theme {
    private readonly options: string;
    private uf: UniversalFunction;
    private readonly commandElement: HTMLElement;
    private listOfThemes: string[];

    constructor(options: string, commandElement: HTMLElement) {
        this.options = options.trim();
        this.uf = new UniversalFunction();
        this.commandElement = commandElement;
        this.listOfThemes = [
            "dark-forest",
            "dark-ocean",
            "dark-space",
            "dark-night",
            "dark-cave",
            "dark-sea",
            "light-vanilla",
            "light-haze",
            "light-day",
            "light-sky",
        ];
        this.parseCommand();
    }

    private parseCommand(): void {
        if (!this.options) {
            this.listThemes();
            return;
        }

        const parts = this.options.split(/\s+/);
        if (parts.length > 2) {
            const errMsg = `theme: too many arguments.<br>type 'theme --help' for help.`;
            this.uf.updateElement("div", "error", errMsg, this.commandElement);
            return;
        }

        const [flag, value] = parts;
        switch (flag) {
            case "--name":
                this.setTheme(value);
                break;
            case "--list":
                this.listThemes();
                break;
            case "--help":
                this.showHelp();
                break;
            default:
                const errMsg = `theme: '${flag}' is not a valid argument.<br>type 'theme --help' for help.`;
                this.uf.updateElement("div", "error", errMsg, this.commandElement);
                break;
        }
    }

    private setTheme(theme: string): void {
        if (this.listOfThemes.includes(theme)) {
            document.body.className = theme;
            this.uf.updateElement(
                "div",
                "output",
                `theme: theme set to ${theme}`,
                this.commandElement
            );
        } else {
            this.uf.updateElement(
                "div",
                "error",
                `theme: '${theme}' is not a valid theme.<br>type 'theme --list' to see the list of themes.`,
                this.commandElement
            );
        }
    }

    private listThemes(): void {
        const outMsg = `Use 'theme --name theme' to set a theme.<br>List of available themes:<br>${
            this.listOfThemes.join("<br>")
        }`;
        this.uf.updateElement(
            "div",
            "output",
            outMsg,
            this.commandElement
        );
    }

    private showHelp(): void {
        const outMsg = `theme: sets the theme of the terminal.<br>
usage: theme [option] [value]<br>
options:<br>
--name [theme name] sets the theme to the given theme name.<br>
--list lists all the available themes.<br>
--help shows this help message.`;
        this.uf.updateElement(
            "div",
            "output",
            outMsg,
            this.commandElement
        );
    }
}
