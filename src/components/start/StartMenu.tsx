import React, { useState } from "react";
import { FocusableBox } from "../shared/FocusableBox.js";
import { Text } from "ink";
import { useKeyBinds } from "../../hooks/useKeyBinds.js";
import { Command } from "../../utils/KeyBinds.js";
import { WhichMode } from "../../App.js";

interface StartMenuProps {
    setMode: (m: WhichMode) => void;
}

export function StartMenu({ setMode }: StartMenuProps): React.ReactNode {
    const [currIndex, setCurrIndex] = useState<number>(0);

    function handleKeyBinds(command: Command | null): void {
        if (command === "UP") {
            currIndex > 0 && setCurrIndex(currIndex - 1);
        }

        if (command === "DOWN") {
            currIndex < 1 && setCurrIndex(currIndex + 1);
        }

        if (command === "RETURN_KEY") {
            currIndex === 0 && setMode("QUIZ");
            currIndex === 1 && setMode("EDIT");
        }
    }

    useKeyBinds(handleKeyBinds);

    return (
        <>
            <FocusableBox isFocus={currIndex === 0}>
                <Text>Quiz</Text>
            </FocusableBox>
            <FocusableBox isFocus={currIndex === 1}>
                <Text>Edit</Text>
            </FocusableBox>
        </>
    );
}
