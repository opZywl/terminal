import React, { useEffect } from "react";
import { initTerminal } from "../services/Core";
import "../styles/App.css";

export default function Terminal() {
    useEffect(() => {
        initTerminal();
        return () => {
            const term = document.getElementById("terminal");
            if (term) term.innerHTML = "";
        };
    }, []);

    return <div id="terminal" className="terminal" />;
}
