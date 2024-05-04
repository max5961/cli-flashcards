import React from "react";
import { useState, createContext } from "react";
import { useApp, useInput, Box } from "ink";
import { Quiz } from "./types.js";
import { CurrentPageView } from "./components/create/Pages.js";
import Read from "./utils/Read.js";
import useStdoutDimensions from "./hooks/useStdoutDimensions.js";

const initialQuizzes: Quiz[] = Read.getData();

interface NormalContext {
    normal: boolean;
    setNormal: (b: boolean) => void;
}
export const NormalContext = createContext<NormalContext | null>(null);

export default function App(): React.ReactElement {
    const { exit } = useApp();
    const [normal, setNormal] = useState<boolean>(true);
    const [cols, rows] = useStdoutDimensions();

    useInput((input, key) => {
        if (key.escape) {
            setNormal(true);
        }

        if (normal && input === "q") {
            exit();
        }
    });

    return (
        <NormalContext.Provider value={{ normal, setNormal }}>
            <Box alignItems="center" justifyContent="center">
                <Box width={75} flexDirection="column" borderStyle="round">
                    <CurrentPageView initialQuizzes={initialQuizzes} />
                </Box>
            </Box>
        </NormalContext.Provider>
    );
}
