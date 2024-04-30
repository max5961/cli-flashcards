import React from "react";
import { useState, createContext } from "react";
import { useApp, useInput, Box } from "ink";
import { CurrentPage } from "./Components/createMode/CreateNew.js";
import { getData } from "./readDir.js";
import useStdoutDimensions from "./useStdoutDimensions.js";
const initialQuizData = getData();
export const NormalContext = createContext(null);
export default function App() {
    const { exit } = useApp();
    const [normal, setNormal] = useState(true);
    const [cols, rows] = useStdoutDimensions();
    useInput((input) => {
        if (normal && input === "q") {
            exit();
        }
    });
    return (React.createElement(NormalContext.Provider, { value: { normal, setNormal } },
        React.createElement(Box, { alignItems: "center", justifyContent: "center" },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round" },
                React.createElement(CurrentPage, { initialQuizData: initialQuizData })))));
}
//# sourceMappingURL=App.js.map