import React, { useRef, useState, useEffect } from "react";
import CompilerOptions from "./CompilerOptions";
import { vscode } from "../../App.jsx";
import "./Selector.css";

const CMD_NAMES = {
    // vscode to webview
    NEW_DATA: "scrape",
    CASE_RESULT: "case-result",
    COMPILE: "compiling",
    RUN_ALL_TO_SEND: "run-all-test-cases-from-key-bindings",
    GOT_EDITORIAL: "got-editorial",

    // webview to vscode
    SAVE_DATA: "save-data",
    RUN_ALL: "run-all-testcases",
    SUBMIT: "submit-code",
    GET_EDITORIAL: "get-editorial",
    SAVE_COMPILER_OPTION: "save-compiler-option",
};

const Selector = ({ language, setSubmitSelect, onSubmit }) => {
    const selectRef = useRef();

    // on mount
    useEffect(() => {
        // set default compiler option
        selectRef.current.value = window.prevCompilerOptions[language];
        console.log(`Selector mounted ${window.prevCompilerOptions[language]}`);
    }, []);

    // ================================================================================ //

    const divHandleClick = (e) => {
        if (e.target.classList.contains("backdrop")) {
            setSubmitSelect(false);
        }
    };

    const submitClickHandler = (e) => {
        if (!selectRef) return;
        setSubmitSelect(false);
        // save to current compiler option
        window.prevCompilerOptions[language] = selectRef.current.value;

        // updates defaultCompilerOptions and sends it to
        // node js backend and for saving data
        vscode.postMessage({
            command: CMD_NAMES.SAVE_COMPILER_OPTION,
            data: window.prevCompilerOptions,
        });

        onSubmit(selectRef.current.value);
    };

    return (
        <div className="backdrop" onClick={divHandleClick}>
            <div className="selector-wrap">
                <div className="selector">
                    <span className="field-name">Language: </span>
                    <select ref={selectRef}>
                        {CompilerOptions[language].map((item, index) => {
                            return (
                                <option key={index} value={item.value}>
                                    {item.text}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <button
                    className="selector-submit"
                    onClick={submitClickHandler}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Selector;
