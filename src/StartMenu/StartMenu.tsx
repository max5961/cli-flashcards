import React, { useContext, useState } from "react";
import { FocusableBox } from "../shared/components/FocusableBox.js";
import { Text } from "ink";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { AppContext } from "../App.js";
import { TitleBox } from "../shared/components/TitleBox.js";
import { Icon } from "../shared/components/Icons.js";

export function StartMenu(): React.ReactNode {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const { setMode, normal } = useContext(AppContext)!;

    function handleKeyBinds(command: Command | null): void {
        if (command === "UP") {
            currIndex > 0 && setCurrIndex(currIndex - 1);
        }

        if (command === "DOWN") {
            currIndex < 1 && setCurrIndex(currIndex + 1);
        }

        if (command === "RETURN_KEY") {
            currIndex === 0 && setMode("CHOOSE_QUIZ");
            currIndex === 1 && setMode("EDIT");
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    return (
        <>
            <TitleBox title="Start Menu" />
            <FocusableBox isFocus={currIndex === 0}>
                <Icon type="QUIZ" />
                <Text>Choose Quiz</Text>
            </FocusableBox>
            <FocusableBox isFocus={currIndex === 1}>
                <Icon type="EDIT" />
                <Text>Edit Quizzes</Text>
            </FocusableBox>
        </>
    );
}
