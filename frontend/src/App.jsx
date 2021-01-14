import React from "react";
import { ProblemStatement } from "./components";
import { useThemeUpdate, useTheme } from "./contexts/ThemeContext";
import "./App.css";

export const vscode = window.acquireVsCodeApi();
let theme = window.darkMode;

function App() {
    const darkMode = useTheme();
    const toggleTheme = useThemeUpdate();

    if (theme) {
        toggleTheme(true);
        theme = false;
    }

    const themeStyle = {
        backgroundColor: darkMode ? "#181a1b" : "#ffffff",
        // padding: "2rem",
    };

    return (
        <div className="app" style={themeStyle}>
            <button
                className="material-icons theme-button"
                style={{ color: darkMode ? "#ffffff" : "#181a1b" }}
                onClick={() => {
                    console.log("Mode!!");
                    toggleTheme(!darkMode);
                }}
            >
                brightness_6
            </button>
            <ProblemStatement />
        </div>
    );
}

export default App;
