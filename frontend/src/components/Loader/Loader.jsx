import React, { useState } from 'react';
import './Loader.css';


const Loader = () => {
    return (
        <div className="backdrop">
            <div className="loader-wrap">
                <div className="loader material-icons">
                    settings
                </div>
                <div className="loader-title">Compiling...</div>
            </div>
        </div>
    )
}

export default Loader;