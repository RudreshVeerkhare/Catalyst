import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./src/App.jsx";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";

render(
    <ThemeProvider>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </ThemeProvider>,
    document.getElementById("root")
);
