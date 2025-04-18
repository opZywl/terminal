import React, { useEffect } from 'react'
import { initTerminal } from '../services/Core'
import '../styles/App.css'

export default function Terminal() {
    useEffect(() => {
        initTerminal()
    }, [])

    return <div id="terminal" className="terminal" />
}
