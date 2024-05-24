import { useEffect, useState } from "react";
import { QI } from "../types.js";
import { QuizState } from "./QuizState.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";

type ResultColor = "" | "green" | "red";
interface QIState {
    inputText: string;
    defaultText: string;
    resultColor: ResultColor;
}

export function useQuestionInput({
    question,
    state,
    setState,
    normal,
    setNormal,
}: {
    question: QI;
    state: QuizState;
    setState: (qs: QuizState) => void;
    normal: boolean;
    setNormal: (b: boolean) => void;
}) {
    const [qiState, setQiState] = useState<QIState>({
        inputText: "",
        defaultText: "",
        resultColor: "",
    });

    useEffect(() => {
        setQiState({
            ...qiState,
            defaultText: "",
            inputText: "",
            resultColor: "",
        });
        setNormal(false);

        return () => {
            // setQiState({
            //     ...qiState,
            // });
            setNormal(true);
        };
    }, [question]);

    function setInputText(s: string): void {
        setQiState({
            ...qiState,
            inputText: s,
        });
    }

    function handleKeyBinds(command: Command | null): void {
        if (command === "EXIT_INSERT") {
            const copy = Object.assign({}, qiState);
            copy.defaultText = qiState.inputText;

            if (qiState.inputText.toUpperCase() === question.a.toUpperCase()) {
                // Intentionally setDefaultText to question.a instead of input. If capitalization
                // is important then this emphasizes that. If capitalization is NOT important, then
                // this prevents you from writing the correct answer without perfect capitalization
                // and not getting notified
                copy.defaultText = question.a;
                copy.inputText = question.a;
                copy.resultColor = "green";

                setState(state.markYes());
            } else if (qiState.inputText !== "") {
                copy.resultColor = "red";
                setState(state.markNo());
            }

            setQiState(copy);
            setNormal(true);
        }

        if (
            command === "ENTER_INSERT" ||
            (normal && command === "RETURN_KEY")
        ) {
            setQiState({
                ...qiState,
            });
            setNormal(false);

            if (state.showingAnswer) {
                setState(state.toggleShowAnswer());
            }
        }

        if (command === "CLEAR_TEXT") {
            setQiState({
                ...qiState,
                inputText: "",
            });
            setNormal(false);
            if (state.showingAnswer) {
                setState(state.toggleShowAnswer());
            }
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    return { qiState, setInputText, normal };
}
