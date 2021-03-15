import React, { useState, useEffect } from "react";
import { vscode } from "../../App.jsx";
import { MathJax } from "../index";

const CMD_NAMES = {
    // webview to vscode
    GET_EDITORIAL: 'get-editorial',
};

const getEditorial = (problemData) => {
    vscode.postMessage({
        command: CMD_NAMES.GET_EDITORIAL,
        data: problemData,
    });
}

const Editorial = ({ problemData, editorialResponse, show }) => {
    const [failed, setFailed] = useState(false);
    const [editorial, setEditorial] = useState("");

    const problemCode = problemData.contestId + problemData.problemIndex;
    useEffect(() => {
        if (show && (failed || !editorial)) getEditorial(problemData);
    }, [show, problemCode]);

    useEffect(() => {
        if (failed || !editorial) {
            setFailed(editorialResponse.error);
            setEditorial(editorialResponse.data || editorialResponse.error);
        }
    }, [editorialResponse.data]);

    return show ?
        <div style={{borderTop: '1px solid rgb(185, 185, 185)'}}>
            <div className="section-title" style={{margin: '.5em 0 .75em 0'}}>Editorial</div>
            <MathJax>
                <div style={failed ? {color: '#d32f2f'}: {}}
                     dangerouslySetInnerHTML={{__html: editorial || "Loading..."}}/>
            </MathJax>
        </div>
        : null;
};

export default Editorial;
