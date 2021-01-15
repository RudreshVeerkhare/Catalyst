import React, { useEffect, useRef, useState } from "react";
import { useTheme, useThemeUpdate } from "../../contexts/ThemeContext";
import "./TestCase.css";

const TestCase = ({
    data,
    index,
    removeTestCase,
    onTestCaseEdit,
    onRun,
    isNew,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const focusRef = useRef();
    /*
        Accepted - #d4edc9
        Wrong - #ffe3e3
    */
    const [bgColor, setBgColor] = useState("");
    const darkMode = useTheme();

    const COLOR = {
        CORRECT: darkMode ? "#2e4718" : "#d4edc9", // #2e4718 darkmode
        WRONG: darkMode ? "#440000" : "#ffe3e3", // #440000 darkmode
        DARK_TESTCASE_BACK: darkMode ? "#212425" : null,
        DARK_TESTCASE: darkMode ? "#ff6d6d" : "#880000",
    };

    /*=============================================================*/

    const onInputClick = (e) => {
        if (e.target.classList.contains("title")) {
            setCollapsed((collapsed) => !collapsed);
        }
    };

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
        if (!data.result) {
            setBgColor("");
            return;
        }
        const userOut = data.result.stdout.replace(/(\r\n|\n)/gm, "").trim();
        const out = data.output.replace(/(\r\n|\n)/gm, "").trim();
        if (
            !data.result.timeout &&
            userOut === out &&
            data.result.stderr == ""
        ) {
            setBgColor(COLOR.CORRECT);
            setCollapsed(true);
            return;
        }
        console.log(userOut, out);
        setBgColor(COLOR.WRONG);
        setCollapsed(false);
    };

    /*=============================================================*/

    useEffect(() => {
        // to set states when problem data changes
        setColorAndSize();
    }, [data.result, darkMode]);

    useEffect(() => {
        // set focus of the element
        if (isNew) focusRef.current.focus();
        setColorAndSize();
    }, []);

    /*=============================================================*/

    return (
        <div key={data.id}>
            <div
                className="input"
                onClick={onInputClick}
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
                        onTestCaseEdit(
                            index - 1,
                            e.target.innerHTML.trim(),
                            "input"
                        )
                    }
                    style={{
                        display: collapsed ? "none" : "",
                        backgroundColor: COLOR.DARK_TESTCASE_BACK,
                        color: COLOR.DARK_TESTCASE,
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        onTestCaseEdit(index - 1, text.trim(), "input");
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
                    Expected Output {index}
                </div>
                <pre
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) =>
                        onTestCaseEdit(index - 1, e.target.innerHTML, "output")
                    }
                    style={{
                        display: collapsed ? "none" : "",
                        backgroundColor: COLOR.DARK_TESTCASE_BACK,
                        color: COLOR.DARK_TESTCASE,
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
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
                    Program Output {index}
                    <div className="controls">
                        {data.result && data.result.signal ? (
                            <div className="signal" style={{ color: "red" }}>
                                {data.result.signal}
                            </div>
                        ) : null}
                        {data.result ? (
                            <div
                                className="timeout"
                                style={{
                                    color: data.result.timeout
                                        ? "red"
                                        : "green",
                                }}
                            >
                                {data.result.time} ms
                            </div>
                        ) : null}
                    </div>
                </div>
                <pre
                    style={{
                        backgroundColor: COLOR.DARK_TESTCASE_BACK,
                        color: COLOR.DARK_TESTCASE,
                    }}
                >
                    {data.result
                        ? data.result.stdout.substring(0, 200) +
                          data.result.stderr.substring(0, 300)
                        : "Run the Testcase"}
                </pre>
            </div>
        </div>
    );
};

export default TestCase;
