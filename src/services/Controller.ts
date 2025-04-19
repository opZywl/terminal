import { UniversalFunction } from './UniversalFunction'
import { Theme } from './Theme'
import { About } from './About'
import { Help } from './Help'
import { History as HistoryDOM } from './History'
import { Resume } from './Resume'
import { Connect } from './Connect'
import { Contact } from './Contact'
import { RA } from './RA'
import { Ping } from './Ping'
import { Decode64 } from './Decode64'
import { Encode64 } from './Encode64'
import { Clock } from './Clock'

export class Controller {
    constructor(
        private InputedCommand: string,
        private commandElement: HTMLElement
    ) {
        this.parseCommand()
    }

    private parseCommand(): void {

        if (RA.isAwaiting()) {
            new RA(this.InputedCommand, this.commandElement);
            return;
        }

        if (Decode64.isAwaiting()) {
            new Decode64(this.InputedCommand, this.commandElement);
            return;
        }

        if (Encode64.isAwaiting()) {
            new Encode64(this.InputedCommand, this.commandElement);
            return;
        }

        const [raw, ...rest] = this.InputedCommand.split(' ')
        const cmd = raw.toLowerCase()
        const arg = rest.join(' ').trim().toLowerCase()

        switch (cmd) {
            case 'help':
                new Help().updateDOM()
                break
            case 'theme':
                new Theme(arg, this.commandElement)
                break
           case 'about':
                new About().updateDOM()
                break
            case 'connect':
                new Connect().updateDOM()
                break
            case 'contact':
                new Contact().updateDOM()
                break
            case 'resume':
                new Resume(arg, this.commandElement)
                break
            case 'ping':
                new Ping(arg, this.commandElement)
                break
            case 'history':
                new HistoryDOM().updateDOM()
                break
            case 'decode64':
                new Decode64(arg, this.commandElement)
                break
            case 'encode64':
                new Encode64(arg, this.commandElement)
                break
            case "clock":
                new Clock(arg, this.commandElement);
                break;
            case "ra":
                new RA(arg, this.commandElement);
                break
            case 'clear':
                document.querySelector<HTMLElement>('#terminal')!.innerHTML = ''
                break
            case 'exit':
                new UniversalFunction().updateElement(
                    'div',
                    'error',
                    "Due to security reasons, you can't close this window using 'exit'.",
                    this.commandElement
                )
                break
            default:
                new UniversalFunction().updateElement(
                    'div',
                    'error',
                    `${cmd}: comando não reconhecido.<br>Digite 'help' para ver os comandos disponíveis.`,
                    this.commandElement
                )
                break
        }
    }
}