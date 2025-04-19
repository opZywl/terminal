import type { ReactNode } from 'react'
import '../styles/App.css'

interface TerminalLayoutProps {
    children: ReactNode
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
    const art = `            ,---------------------------,
            | ,-----------------------, |
            | |      Hello            | |
            | |       World!          | |
            | |         CLI           | |
            | |           is cool!    | |
            | |_______________________| |
            |___________________________|
            ,---\\_____     []     _______/------,
            /         /______________\\           /|
            /___________________________________ /  | ___
            |                                   |   |    /
            |  _ _ _                 [-------]  |   |   (
            |  o o o                 [-------]  |  /    _)_
            |__________________________________ |/     / / /'
            /-------------------------------------/       /\`\`\`/'
            /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/         \`\`\`\`\`
            /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`

    const nameBlock = `            ██▓     █    ██  ▄████▄   ▄▄▄        ██████    ▓██   ██▓▒███████▒▓██   ██▓
            ▓██▒     ██  ▓██▒▒██▀ ▀█  ▒████▄    ▒██    ▒     ▒██  ██▒▒ ▒ ▒ ▄▀░ ▒██  ██▒
            ▒██░    ▓██  ▒██░▒▓█    ▄ ▒██  ▀█▄  ░ ▓██▄        ▒██ ██░░ ▒ ▄▀▒░   ▒██ ██░
            ▒██░    ▓▓█  ░██░▒▓▓▄ ▄██▒░██▄▄▄▄██   ▒   ██▒     ░ ▐██▓░  ▄▀▒   ░  ░ ▐██▓░
            ░██████▒▒▒█████▓ ▒ ▓███▀ ░ ▓█   ▓██▒▒██████▒▒     ░ ██▒▓░▒███████▒  ░ ██▒▓░
            ░ ▒░▓  ░░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░ ▒▒   ▓▒█░▒ ▒▓▒ ▒ ░      ██▒▒▒ ░▒▒ ▓░▒░▒   ██▒▒▒
            ░ ░ ▒  ░░░▒░ ░ ░   ░  ▒     ▒   ▒▒ ░░ ░▒  ░ ░    ▓██ ░▒░ ░░▒ ▒ ░ ▒ ▓██ ░▒░
            ░ ░    ░░░ ░ ░ ░          ░   ▒   ░  ░  ░      ▒ ▒ ░░  ░ ░ ░ ░ ░ ▒ ▒ ░░
            ░  ░   ░     ░ ░            ░  ░      ░      ░ ░       ░ ░     ░ ░
            ░                               ░ ░     ░         ░ ░`

    return (
        <main>
            <p className="version">Terminal – sem regras v1.0.0 by Lucas Lima</p>

            <div className="intro">
                <div className="art"><pre>{art}</pre></div>
                <div className="name"><pre>{nameBlock}</pre></div>
            </div>

            <div className="help">
                <p>
                    Bem vindo ao meu ssh interativo!!<br />
                    Para uma lista de comandos, escreva <span className="keyword">help</span>.
                </p>
            </div>

            <div id="terminal">{children}</div>
        </main>
    )
}