import React from "react";
import { useState, createContext } from "react";
import { useApp, useInput, Box } from "ink";
import { CurrentPageView } from "./components/create/Pages.js";
import Read from "./utils/Read.js";
import useStdoutDimensions from "./hooks/useStdoutDimensions.js";
const initialQuizzes = Read.getData();
export const NormalContext = createContext(null);
export default function App() {
    const { exit } = useApp();
    const [normal, setNormal] = useState(true);
    const [cols, rows] = useStdoutDimensions();
    useInput((input, key) => {
        if (key.escape) {
            setNormal(true);
        }
        if (normal && input === "q") {
            exit();
        }
    });
    return (React.createElement(NormalContext.Provider, { value: { normal, setNormal } },
        React.createElement(Box, { alignItems: "center", justifyContent: "center" },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round" },
                React.createElement(CurrentPageView, { initialQuizzes: initialQuizzes })))));
}
//# sourceMappingURL=App.js.map