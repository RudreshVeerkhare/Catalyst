import React, { useContext, useState } from 'react';

const ThemeContext = React.createContext();
const ThemeUpdateContext = React.createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
}

export const useThemeUpdate = () => {
    return useContext(ThemeUpdateContext);
}

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => false);

    const toggleTheme = (val) => {
        setDarkMode(val);
    }

    return (
        <ThemeContext.Provider value={darkMode}>
            <ThemeUpdateContext.Provider value={toggleTheme}>
                {children}
            </ThemeUpdateContext.Provider>
        </ThemeContext.Provider>
    )
}