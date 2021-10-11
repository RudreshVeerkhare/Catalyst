import React, { useEffect } from "react";
import { ProblemStatement } from "./components";
import { useThemeUpdate, useTheme } from "./contexts/ThemeContext";
import { useLanguage, useLanguageUpdate } from "./contexts/LanguageContext";
import "./App.css";
import en_png from "./assets/en.png";
import ru_png from "./assets/ru.png";

export const vscode = window.acquireVsCodeApi();
let theme = window.darkMode;
let initLangId = window.langId;

const png = {
    en: en_png,
    ru: ru_png,
};

function App() {
    const darkMode = useTheme();
    const toggleTheme = useThemeUpdate();

    const langId = useLanguage();
    const toggleLanguage = useLanguageUpdate();

    useEffect(() => {
        // set initial lang id and theme
        toggleLanguage(window.langId);
        toggleTheme(window.darkMode);
    }, []);

    const changeLanguage = () => {
        const langs = ["en", "ru"];
        const arr = langs.concat(langs);
        let i = 0;
        while (arr[i] !== langId) i++;

        if (i >= arr.length) return;

        toggleLanguage(arr[i + 1]);
    };

    const themeStyle = {
        backgroundColor: darkMode ? "#181a1b" : "#ffffff",
        // padding: "2rem",
    };

    return (
        <div className="app" style={themeStyle}>
            <button
                title="Change language"
                className="material-icons lang-button"
                style={{ color: darkMode ? "#ffffff" : "#181a1b" }}
                onClick={() => {
                    changeLanguage();
                }}
            >
                <img src={png[langId]} />
            </button>
            <button
                title="Toggle theme"
                className="material-icons theme-button"
                style={{ color: darkMode ? "#ffffff" : "#181a1b" }}
                onClick={() => {
                    // console.log("Mode!!");
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
