import { useContext, useState } from "react";
import { AppContext } from "../App.js";
import { QuizState } from "./QuizState.js";
import { Question } from "../types.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { RetakeQuestions } from "./useCompletedPage.js";

type Message = null | "SHUFFLE";
export function useQuizMode(questions: Readonly<Question[]>) {
    const { normal } = useContext(AppContext)!;
    const [message, setMessage] = useState<Message>(null);
    const [state, setState] = useState<QuizState>(new QuizState(questions, {}));
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

    const question: Question = state.getQuestion(questions);

    function getRetakeQuestions(): RetakeQuestions {
        const incorrect: Question[] = state.indexes
            .filter((index: number) => {
                return state.evalMap[index] === "NO";
            })
            .map((index: number) => questions[index]);

        const notEval: Question[] = state.indexes
            .filter((index: number) => {
                return !state.evalMap[index];
            })
            .map((index: number) => questions[index]);

        return {
            incorrect: incorrect,
            notEval: notEval,
            allQuestions: questions,
        };
    }

    function handleKeyBinds(command: Command | null): void {
        if (command === "LEFT") {
            setState(state.prevQuestion());
        }

        if (command === "RIGHT") {
            if (state.position >= questions.length - 1) {
                setQuizCompleted(true);
            }
            setState(state.nextQuestion());
        }

        if (command === "UP") {
            setState(state.moveFocusUp(questions));
        }

        if (command === "DOWN") {
            setState(state.moveFocusDown(questions));
        }

        if (command === "MARK_NO") {
            setState(state.markNo());
        }

        if (command === "MARK_YES") {
            setState(state.markYes());
        }

        if (command === "TOGGLE_SHOW_ANSWER") {
            if (normal) {
                setState(state.toggleShowAnswer());
            }
        }

        if (command === "RETURN_KEY") {
            if (question.type === "mc") {
                setState(state.chooseMc(question));
            }
        }

        if (command === "SHUFFLE_QUESTIONS") {
            setState(state.shuffle(questions));
            setMessage("SHUFFLE");
            setTimeout(() => {
                setMessage(null);
            }, 1000);
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    return { message, quizCompleted, getRetakeQuestions, state, setState };
}
