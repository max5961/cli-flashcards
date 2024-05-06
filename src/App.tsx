import React, { useState } from "react";
import { createContext } from "react";
import { Box } from "ink";
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
    const [cols, rows] = useStdoutDimensions();
    const [normal, setNormal] = useState<boolean>(true);

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
