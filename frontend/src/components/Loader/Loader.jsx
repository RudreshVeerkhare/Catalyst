import React, { useState } from 'react';
import BarLoader from 'react-spinners/BarLoader';
import './Loader.css';


const Loader = () => {
    return (
        <div className="backdrop">
            <div className="loader-wrap">
                <BarLoader
                color={"#ffffff"}
                loading={true}
                />
                <div className="loader-title">Compiling...</div>
            </div>
        </div>
    )
}

export default Loader;