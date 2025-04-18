import { Controller } from './Controller'
import { History } from './History'

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.body.classList.add(isDark ? 'dark-forest' : 'light-vanilla')

const terminal = document.getElementById('terminal')!

const history = new History()

function getTime(date: Date): string {
    const h24 = date.getHours()
    const hours = h24 % 12 || 12
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const meridian = h24 >= 12 ? 'PM' : 'AM'
    return `${hours}:${minutes}:${seconds} ${meridian}`
}

function addCommand(): void {
    const cmdEl = document.createElement('div')
    cmdEl.classList.add('command')
    cmdEl.innerHTML = `
    <div class="line1">
      <div>
        <span class="os">╭─ </span>
        <span class="user">guest@</span>
        <span class="host">opzywl-services.com</span>
        <span class="path">~</span>
      </div>
      <div>
        <span class="time">  ${getTime(new Date())}</span>
      </div>
    </div>
    <div class="line2">
      <span class="user_type">╰─ $ </span>
      <input type="text" class="command_input" id="command_input" />
    </div>
  `
    terminal.appendChild(cmdEl)

    const inputEl = cmdEl.querySelector<HTMLInputElement>('#command_input')
    if (!inputEl) return
    inputEl.focus()

    const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter') {
            inputEl.readOnly = true
            const val = inputEl.value.trim()
            if (val) {
                history.add(val)
                new Controller(val, cmdEl)
            }
            inputEl.removeEventListener('keydown', onKeyDown)
            inputEl.removeAttribute('id')
            history.resetIndex()
            addCommand()
        } else if (ev.key === 'ArrowUp') {
            history.up()
        } else if (ev.key === 'ArrowDown') {
            history.down()
        }
    }

    inputEl.addEventListener('keydown', onKeyDown)
}

addCommand()

document.addEventListener('click', () => {
    const active = terminal.querySelector<HTMLInputElement>(
        'input.command_input:not([readonly])'
    )
    active?.focus()
})
