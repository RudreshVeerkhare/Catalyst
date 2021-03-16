import React, { useState, useEffect } from "react";
import { vscode } from "../../App.jsx";
import { MathJax } from "../index.js";

const CMD_NAMES = {
    // vscode to webview
    GOT_EDITORIAL: "got-editorial",

    // webview to vscode
    GET_EDITORIAL: "get-editorial",
};

const Editorial = ({ show, problemData }) => {
    const [editorial, setEditorial] = useState({ error: null, data: "" });
    //====================================================================

    useEffect(() => {
        // mount message listener for messages from backend
        const messageListener = (event) => {
            const message = event.data; // The JSON data our extension sent
            switch (message.command) {
                case CMD_NAMES.GOT_EDITORIAL: {
                    setEditorial(message.data);
                    console.log(message.data);
                    break;
                }
            }
        };

        window.addEventListener("message", messageListener);

        return () => {
            window.removeEventListener("message", messageListener);
        };
    }, []);

    useEffect(() => {
        setEditorial({ error: null, data: "" });
    }, [problemData]);

    // ====================================================================

    return show ? (
        <MathJax>
            <div style={{ borderTop: "1px solid rgb(185, 185, 185)" }}>
                <div
                    className="section-title"
                    style={{ margin: ".5em 0 .75em 0" }}
                >
                    Editorial
                </div>
                <div
                    style={editorial.error ? { color: "#d32f2f" } : {}}
                    dangerouslySetInnerHTML={{
                        __html: editorial.error
                            ? editorial.error
                            : editorial.data || "Loading...",
                    }}
                />
            </div>
        </MathJax>
    ) : null;
};

export default Editorial;
