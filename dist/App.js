import React, { useState } from "react";
import { createContext } from "react";
import { Box } from "ink";
import { CurrentPageView } from "./components/create/Pages.js";
import Read from "./utils/Read.js";
import useStdoutDimensions from "./hooks/useStdoutDimensions.js";
const initialQuizzes = Read.getData();
export const NormalContext = createContext(null);
export default function App() {
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState(true);
    return (React.createElement(NormalContext.Provider, { value: { normal, setNormal } },
        React.createElement(Box, { alignItems: "center", justifyContent: "center" },
            React.createElement(Box, { width: 75, flexDirection: "column", borderStyle: "round" },
                React.createElement(CurrentPageView, { initialQuizzes: initialQuizzes })))));
}
//# sourceMappingURL=App.js.map