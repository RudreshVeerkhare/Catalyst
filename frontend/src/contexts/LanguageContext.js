import React, { useContext, useState } from "react";

const LanguageContext = React.createContext();
const LanguageUpdateContext = React.createContext();

export const useLanguage = () => {
    return useContext(LanguageContext);
};

export const useLanguageUpdate = () => {
    return useContext(LanguageUpdateContext);
};

export const LanguageProvider = ({ children }) => {
    const [langId, setlangId] = useState(() => "en");

    const toggleLanguage = (val) => {
        setlangId(val);
    };

    return (
        <LanguageContext.Provider value={langId}>
            <LanguageUpdateContext.Provider value={toggleLanguage}>
                {children}
            </LanguageUpdateContext.Provider>
        </LanguageContext.Provider>
    );
};
