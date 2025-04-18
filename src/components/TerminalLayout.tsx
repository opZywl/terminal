import React from 'react'
import '../styles/App.css'

export const TerminalLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <main>
        <p className="version">Terminal – sem regras v1.0.0 by Lucas Lima</p>
        <div className="intro">
            <div className="art">{}</div>
            <div className="name">{}</div>
        </div>
        <div className="help">
            <p>
                Bem vindo ao meu ssh interativo!! Para uma lista de comandos,
                escreva <span className="keyword">help</span>.
            </p>
        </div>
        <div id="terminal">{children}</div>
    </main>
)

export default TerminalLayout
