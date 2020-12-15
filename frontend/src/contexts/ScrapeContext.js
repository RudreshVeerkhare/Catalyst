import React, { createContext, useContext, useState, useEffect } from 'react';

const Context = createContext();

export const getData = () => {
    return useContext(Context);
}



export const ScrapeContext = ({ children }) => {
    const [ data, setData ] = useState();
    console.log("added this");

   

    // useEffect(() => {
    //     // getting data from backend
    //     window.addEventListener('message', event => {
    //         const message = event.data; // The JSON data our extension sent
    //         switch (message.command) {
    //             case 'scrape':
    //                 console.log("Got Data");
    //                 const scrape = message.data;
    //                 setData(scrape);
    //                 break;
    //         }
    //     });

    //     // remove eventlistener when component is deleted.
    //     // return () => {
    //     //     window.removeEventListener('message', listener);
    //     // }
    // }, []);
    
    return (
        <Context.Provider value={data}>
            { children }
        </Context.Provider>
    )
}
