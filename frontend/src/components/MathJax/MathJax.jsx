import React, { useRef, useEffect } from 'react';

const MathJax = ({ children }) => {
    const childRef = useRef();
    
    useEffect(() => {
        window.MathJax.Hub.Queue([
            "Typeset",
            window.MathJax.Hub,
            childRef.current
        ]);
        // console.log("MathJax applied again!!");
    });

    return (
        <div className="mathdiv" ref={childRef}>
            { children }
        </div>
    )
}

export default MathJax;