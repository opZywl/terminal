import { UniversalFunction } from './UniversalFunction';

interface CommandOption {
    option: string;
    description: string;
}

interface Command {
    name: string;
    description: string;
    options?: CommandOption[];
}

const commands: Command[] = [
    { name: 'help', description: 'Lista de comandos.' },
    { name: 'about', description: 'Sobre mim.' },
    { name: 'clear', description: 'Limpa o terminal.' },
    { name: 'history', description: 'Histórico de comandos.' },
    {
        name: 'theme',
        description: 'Muda o tema do terminal.',
        options: [
            {
                option: '--name [theme-name]',
                description: 'Change the theme to the given theme name.'
            },
            { option: '--list', description: 'List all the themes.' }
        ]
    },
    {
        name: 'ping',
        description: 'Ping a domain.',
        options: [{ option: 'domain', description: 'The domain to ping' }]
    },
    {
        name: 'connect',
        description: 'Conecte-se comigo.',
        options: [
            { option: '--goto [social-network]', description: 'Go to the given social network.' },
            { option: '--list', description: 'List all the social networks.' }
        ]
    },
    {
        name: 'contact',
        description: 'Mostrar informações de contato.',
        options: [
            { option: '--goto [contact-method]', description: 'Go to the given contact method.' },
            { option: '--list', description: 'List all the contact methods.' }
        ]
    },
    {
        name: 'resume',
        description: 'Mostrar CV.',
        options: [{ option: '--download', description: 'Download the resume. 📥' }]
    },
    {
        name: 'ra',
        description: 'RA Database leak unasp. 2021 & 2025 by opzywl.'
    },
    { name: 'exit', description: 'Sai do terminal.' }
];

export class Help {
    toString(): string {
        return commands
            .map(
                (cmd) =>
                    `<p class="two-col"><span class="keyword">${cmd.name}</span><span>${cmd.description}</span></p>`
            )
            .join('');
    }

    updateDOM(): void {
        new UniversalFunction().updateElement('div', 'output', this.toString());
    }
}
