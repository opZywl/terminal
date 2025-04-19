import React, { useEffect } from 'react'
import TerminalLayout from './components/TerminalLayout'
import Terminal from './components/Terminal'
import { initTerminal } from './services/Core'

export default function App() {
    useEffect(() => {
        initTerminal()
    }, [])

    return (
        <TerminalLayout>
            <Terminal />
        </TerminalLayout>
    )
}