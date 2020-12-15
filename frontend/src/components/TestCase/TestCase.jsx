import React, { useEffect, useRef, useState } from "react";
import "./TestCase.css";

const COLOR = {
    CORRECT: "#d4edc9",
    WRONG: "#ffe3e3"
}

const TestCase = ({ data, index, removeTestCase, onTestCaseEdit, onRun }) => {
    const [collapsed, setCollapsed] = useState(false);
    const focusRef = useRef();
    /*
        Accepted - #d4edc9
        Wrong - #ffe3e3
    */
    const [bgColor, setBgColor] = useState("");

    /*=============================================================*/

    const toggleView = () => {
        setCollapsed((collapsed) => !collapsed);
    };

    const onInputChange = (event) => {
        console.log(event.target.innerHTML);
        // data.input = event.target.value;
    };

    const onOutputChange = (event) => {
        console.log(event.target.innerHTML);
        // data.output = event.target.value;
    };

    const setColorAndSize = () => {
        if(!data.result){
            setBgColor("");
            return;
        }
        const userOut = data.result.stdout.replace(/(\r\n|\n)/gm, "");
        const out = data.output.replace(/(\r\n|\n)/gm, "");
        if(!data.result.timeout && userOut === out){
            setBgColor(COLOR.CORRECT);
            setCollapsed(true);
            return;
        }
        console.log(userOut, out);
        setBgColor(COLOR.WRONG);
        setCollapsed(false);
    }

    /*=============================================================*/

    useEffect(() => {
        // to set states when problem data changes
        setColorAndSize();
    }, [data.result]);

    useEffect(() => {
        // set focus of the element
        focusRef.current.focus();
        setColorAndSize();
    }, []);

    /*=============================================================*/

    return (
        <div key={data.id}>
            <div
                className="input"
                style={{ borderBottom: collapsed ? "none" : "" }}
            >
                <div className="title" style={{ backgroundColor: bgColor }}>
                    Input {index}
                    <div className="controls">
                        <button
                            className="rerun material-icons"
                            title="run testcase"
                            onClick={() => {
                                onRun(data.id);
                            }}
                        >
                            play_arrow
                        </button>
                        <button
                            className="delete material-icons"
                            title="delete testcase"
                            onClick={() => {
                                removeTestCase(data.id);
                            }}
                        >
                            delete
                        </button>
                        {collapsed ? (
                            <button
                                className="dropdown material-icons"
                                onClick={toggleView}
                                title="expand view"
                            >
                                menu
                            </button>
                        ) : (
                            <button
                                className="dropdown material-icons"
                                onClick={toggleView}
                                title="collapse view"
                            >
                                horizontal_rule
                            </button>
                        )}
                    </div>
                </div>
                <pre
                    ref={focusRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                        onTestCaseEdit(index - 1, e.target.innerHTML.trim(), "input")
                    }
                    style={{ display: collapsed ? "none" : "" }}
                    onPaste={(e) => {
                        e.preventDefault()
                        const text = e.clipboardData.getData('text/plain');
                        onTestCaseEdit(index - 1, text.trim(), "input")
                    }}
                >
                    {data.input}
                </pre>
            </div>
            <div
                className="output"
                style={{
                    borderBottom: "none",
                    marginBottom: 0,
                    display: collapsed ? "none" : "",
                }}
            >
                <div className="title" style={{ backgroundColor: bgColor }}>
                    Output {index}
                </div>
                <pre
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                        onTestCaseEdit(index - 1, e.target.innerHTML, "output")
                    }
                    style={{ display: collapsed ? "none" : "" }}
                    onPaste={(e) => {
                        e.preventDefault()
                        const text = e.clipboardData.getData('text/plain');
                        onTestCaseEdit(index - 1, text.trim(), "output");
                    }}
                >
                    {data.output}
                </pre>
            </div>
            <div
                className="output"
                style={{ display: collapsed ? "none" : "" }}
            >
                <div className="title" style={{ backgroundColor: bgColor }}>
                    User Output {index}
                    <div className="controls">
                        { data.result && data.result.signal ?
                        <div className="signal" style={{color: "red"}}>
                            {data.result.signal}
                        </div>:
                        null
                        }
                        { data.result ?
                        <div className="timeout" style={{color: data.result.timeout ? "red" : "green"}}>
                            {data.result.time} ms
                        </div>:
                        null
                        }
                    </div>
                </div>
                <pre>{data.result ? data.result.stdout.substring(0, 200) + data.result.stderr.substring(0, 300): "Run the Testcase"}</pre>
            </div>
        </div>
    );
};

export default TestCase;
