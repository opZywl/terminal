import { UniversalFunction } from './UniversalFunction'

export class History {
    private history: string[]
    private index: number

    constructor() {
        const data = localStorage.getItem('history')
        this.history = data ? JSON.parse(data) : []
        this.index = this.history.length
    }

    add(command: string): void {
        if (this.history.at(-1) !== command) {
            this.history.push(command)
            this.index = this.history.length
            localStorage.setItem('history', JSON.stringify(this.history))
        }
    }

    up(): void {
        if (this.index > 0) {
            this.index--
            const input = document.getElementById(
                'command_input'
            ) as HTMLInputElement | null
            if (input) input.value = this.history[this.index]
        }
    }

    down(): void {
        if (this.index < this.history.length - 1) {
            this.index++
            const input = document.getElementById(
                'command_input'
            ) as HTMLInputElement | null
            if (input) input.value = this.history[this.index]
        }
    }

    resetIndex(): void {
        this.index = this.history.length
    }

    toString(): string {
        return (
            `<p class="two-col"><span>Id</span><span>Command</span></p>` +
            this.history
                .map((cmd, i) => `<p class="two-col"><span>${i + 1}</span><span>${cmd}</span></p>`)
                .join('')
        )
    }

    updateDOM(): void {
        new UniversalFunction().updateElement('div', 'output', this.toString())
    }
}
