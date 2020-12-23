import React, { useEffect, useRef, useState } from "react";
import { vscode } from "../../App.jsx";
import { MathJax, TestCase, Loader, Selector } from "../index";
import "./ProblemStatement.css";
import "./Style.css";

const CMD_NAMES = {
    // vscode to webview
    NEW_DATA: 'scrape',
    CASE_RESULT: 'case-result',
    COMPILE: 'compiling',
    RUN_ALL_TO_SEND: 'run-all-test-cases-from-key-bindings',

    // webview to vscode
    SAVE_DATA: 'save-data',
    RUN_ALL: 'run-all-testcases',
    SUBMIT: 'submit-code',
}

const ProblemStatement = () => {
    // getting data from
    /*=============================================================*/
    const [data, setData] = useState(() => {
        const temp = window.intialData;
        window.intialData = null;
        return temp;
    });
    const [compiling, setCompiling] = useState(false);
    const [submitSelect, setSubmitSelect] = useState(false);
    const runAllRef = useRef();
    /*=============================================================*/
    useEffect(() => {
        // mount message listener for messages from backend
        const messageListener = (event) => {
            const message = event.data; // The JSON data our extension sent
            switch (message.command) {
                case CMD_NAMES.NEW_DATA: {
                    setData(message.data);
                    break;
                }
                case CMD_NAMES.CASE_RESULT: {
                    // console.log(message.data);
                    addOutput(message.data);
                    break;
                }
                case CMD_NAMES.COMPILE: {
                    // console.log("Compiling msg", message.data);
                    setCompiling(message.data);
                    break;
                }
                case CMD_NAMES.RUN_ALL_TO_SEND: {
                    // console.log(runAllRef.current);
                    runAllRef.current.click();
                    break;
                }
            }
        };

        window.addEventListener("message", messageListener);

        return () => {
            window.removeEventListener("message", messageListener);
        };
    }, []);

    useEffect(() => {
        // saving data in file
        // console.log("Saving data");
        saveData();
    }, [data]);

    /*=============================================================*/

    const addOutput = (result) => {
        setData((prevData) => ({
            ...prevData,
            sampleTestcases: prevData.sampleTestcases.map((testcase) => {
                if (testcase.id === result.id) {
                    testcase.result = result;
                }
                return testcase;
            }),
        }));
    };

    const addNewTestCase = (event) => {
        // add testcase at the end of list
        setData((prevData) => ({
            ...prevData,
            sampleTestcases: [
                ...prevData.sampleTestcases,
                {
                    id: new Date().getTime(),
                    input: "",
                    output: "",
                },
            ],
        }));
    };

    const removeTestCase = (id) => {
        // removes testcase with given id
        setData((prevData) => ({
            ...prevData,
            sampleTestcases: prevData.sampleTestcases.filter(
                (item) => item.id !== id
            ),
        }));
    };

    const runAllTestcases = () => {
        // sends problem data to backend to save it
        if (!data) return;
        console.log(data);
        vscode.postMessage({
            command: CMD_NAMES.RUN_ALL,
            data: data,
        });
    };

    const runSingleTestcases = (id) => {
        if (!data) return;
        vscode.postMessage({
            command: CMD_NAMES.RUN_ALL,
            data: data,
            id: id,
        });
    };

    const saveData = () => {
        vscode.postMessage({
            command: CMD_NAMES.SAVE_DATA,
            data: data,
        });
    };

    const onTestCaseEdit = (index, data, type) => {
        setData((prevData) => ({
            ...prevData,
            sampleTestcases: prevData.sampleTestcases.map((testcase, i) => {
                if (i == index) {
                    if (type === "input") return { ...testcase, input: data };
                    if (type === "output") return { ...testcase, output: data };
                }
                return testcase;
            }),
        }));
    };

    const submitToCodeforces = (langId) => {
        data.langId = langId;
        vscode.postMessage({
            command: CMD_NAMES.SUBMIT,
            data: data
        });
    }

    /*=============================================================*/
    return data ? (
        <MathJax>
            <div className="ttypography">
                <div className="problem-statement">
                    {/* Header */}
                    <div className="header">
                        {/* Problem Title */}
                        <div className="title">{data.title}</div>
                        {/* Time Limit */}
                        <div className="time-limit">
                            <div className="property-title">
                                time limit per test
                            </div>
                            {data.timeLimit}
                        </div>
                        {/* Memmory Limit */}
                        <div className="memory-limit">
                            <div className="property-title">
                                memory limit per test
                            </div>
                            {data.memLimit}
                        </div>
                        {/* Input Format */}
                        <div className="input-file">
                            <div className="property-title">input</div>
                            {data.inputFormat}
                        </div>
                        {/* Output Format */}
                        <div className="output-file">
                            <div className="property-title">output</div>
                            {data.outputFormat}
                        </div>
                    </div>

                    {/* Problem HTML */}
                    <div
                        dangerouslySetInnerHTML={{ __html: data.problemHtml }}
                    />

                    {/* Input Specifications */}
                    <div
                        className="input-specification"
                        dangerouslySetInnerHTML={{ __html: data.inSpecsHtml }}
                    />

                    {/* Output Specifications */}
                    <div
                        className="output-specification"
                        dangerouslySetInnerHTML={{ __html: data.outSpecsHtml }}
                    />

                    {/* Note Html*/}
                    <div
                        className="note"
                        dangerouslySetInnerHTML={{ __html: data.noteHtml }}
                    />

                    {/* Sample Cases */}
                    {data.sampleTestcases.length ? (
                        <div className="sample-tests">
                            <div className="section-title">Example</div>
                            <div className="sample-test">
                                {data.sampleTestcases.map((testcase, index) => (
                                    <TestCase
                                        key={testcase.id}
                                        data={testcase}
                                        index={index + 1}
                                        removeTestCase={removeTestCase}
                                        onTestCaseEdit={onTestCaseEdit}
                                        onRun={runSingleTestcases}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Controller buttons */}
                    <div className="control-btns">
                        <button
                            ref={runAllRef}
                            className="run-all"
                            title="Run all testcases (Ctrl+Enter)"
                            onClick={(e) => runAllTestcases()}
                        >
                            <div className="material-icons">play_arrow</div>Run
                            All
                        </button>
                        <button
                            className="new-testcase"
                            title="Add new testcase"
                            onClick={addNewTestCase}
                        >
                            <div className="material-icons">add</div>New
                            Testcase
                        </button>
                        <button className="submit" title="Submit on Codeforces" onClick={() => {setSubmitSelect(true)}}>
                            <div className="material-icons">done_all</div>Submit
                        </button>
                    </div>
                </div>
            </div>
            {compiling ? <Loader /> : null}
            {submitSelect ? (
                <Selector
                    language={data.language}
                    setSubmitSelect={setSubmitSelect}
                    onSubmit={submitToCodeforces}
                />
            ) : null}
        </MathJax>
    ) : (
        <h1>Loading...</h1>
    );
};

export default ProblemStatement;
