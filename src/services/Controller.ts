// src/services/Controller.ts
import { UniversalFunction } from './UniversalFunction'
//import { Theme } from './Theme'
//import { About } from './About'
import { Help } from './Help'
import { History as HistoryDOM } from './History'
/* import { Resume } from './Resume'
import { Connect } from './Connect'
import { Contact } from './Contact'
import { RA } from './RA'
import { Ping } from './Ping'

 */

export class Controller {
    constructor(
        private InputedCommand: string,
        private commandElement: HTMLElement
    ) {
        this.parseCommand()
    }

    private parseCommand(): void {
        const [raw, ...rest] = this.InputedCommand.split(' ')
        const cmd = raw.toLowerCase()
        const arg = rest.join(' ').trim().toLowerCase()

        switch (cmd) {
            case 'help':
                new Help().updateDOM()
                break
          /*  case 'about':
                new About().updateDOM()
                break
            case 'ping':
                new Ping(arg, this.commandElement)
                break
            case 'theme':
                new Theme(arg, this.commandElement)
                break

           */
            case 'history':
                new HistoryDOM().updateDOM()
                break
         /*   case 'resume':
                new Resume(arg, this.commandElement)
                break
            case 'connect':
                new Connect().updateDOM()
                break
            case 'contact':
                new Contact().updateDOM()
                break
            case 'ra':
                new RA().updateDOM()
                break

          */
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
