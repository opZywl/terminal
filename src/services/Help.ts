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
    { name: 'help', description: 'Show the complete list of available commands.' },
    { name: 'clear', description: 'Clear the terminal screen.' },
    { name: 'history', description: 'Display previously executed commands.' },
    { name: 'exit', description: 'Exit and close the terminal session.' },

    { name: 'about', description: 'Display a short description about me.' },
    {
        name: 'resume',
        description: 'View my resume with experience and skills.',
        options: [{ option: '--download', description: 'Download the resume. 📥' }]
    },
    {
        name: 'contact',
        description: 'View available contact methods.',
        options: [
            { option: '--list', description: 'List all contact methods.' },
            { option: '--goto [contact-method]', description: 'Open the specified contact method.' }
        ]
    },

    {
        name: 'theme',
        description: 'Customize the appearance of the terminal.',
        options: [
            { option: '--list', description: 'Show all available themes.' },
            { option: '--name [theme-name]', description: 'Apply the specified theme.' }
        ]
    },

    { name: 'pages', description: 'Access previously saved pages and links.' },

    { name: 'clock', description: 'Check the current time in different countries and time zones.' },
    {
        name: 'ping',
        description: 'Check the status and latency of a specific domain.',
        options: [{ option: 'domain', description: 'Domain to perform the ping.' }]
    },
    { name: 'encode64', description: 'Encode text to Base64.' },
    { name: 'decode64', description: 'Decode text from Base64.' },

    { name: 'ra', description: 'SI Query database leak from UNASP (2022 & 2025).' },
    { name: 'fdpclient', description: 'List versions and download counts from GitHub releases.' }
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