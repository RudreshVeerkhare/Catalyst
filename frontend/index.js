import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./src/App.jsx";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

render(
    <TransformWrapper
        wheel={{ wheelEnabled: false, touchPadEnabled: true, step: 35 }}
        doubleClick={{ mode: "reset" }}
        scalePadding={{ disabled: true }}
        pan={{ padding: true, paddingSize: 0 }}
        zoomIn={{ animation: false }}
        zoomOut={{ animation: false }}
    >
        <TransformComponent>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </TransformComponent>
    </TransformWrapper>,

    document.getElementById("root")
);
