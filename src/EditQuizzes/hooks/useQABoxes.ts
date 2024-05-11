import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App.js";
import { PageContext, QpvContext } from "../EditQuizzesView.js";
import { QpvNode, QpvUtils } from "../utils/QpvUtils.js";
import { Command } from "../../shared/utils/KeyBinds.js";
import { PageStack } from "../../shared/utils/PageStack.js";
import { Question } from "../../types.js";
import { Write } from "../../shared/utils/Write.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";

export function useQABox() {
    const { normal, setNormal } = useContext(AppContext)!;
    const { data, currNode } = useContext(QpvContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;

    const [questionInput, setQuestionInput] = useState<string>(data.q);
    const [answerInput, setAnswerInput] = useState<string>(data.a);

    useEffect(() => {
        setQuestionInput(data.q);
        setAnswerInput(data.a);
    }, [pageStack]);

    function acceptsInput(targetNode: QpvNode): boolean {
        return currNode === targetNode && !normal;
    }

    function getBorderColor(targetNode: QpvNode): string {
        if (currNode === targetNode) {
            return "blue";
        }
        return "";
    }

    // highlight border with red if not a valid multiple choice answer
    function getAnswerBorderColor(): string {
        if (data.type !== "mc") return getBorderColor("answer");

        const possibleValues: string[] = [];
        for (let i = 0; i < data.choices.length; ++i) {
            possibleValues.push(String.fromCharCode(65 + i));
        }

        // capitalization does not matter
        if (
            !possibleValues.includes(answerInput.toUpperCase()) &&
            !possibleValues.includes(data.a.toUpperCase())
        ) {
            return "red";
        } else {
            return getBorderColor("answer");
        }
    }

    function handleKeyBinds(command: Command | null): void {
        if (currNode !== "question" && currNode !== "answer") {
            return;
        }

        if (command === "CLEAR") {
            setNormal(false);
            setQuestionInput("");
            setAnswerInput("");
        }

        if (command === "ENTER_INSERT" || command === "RETURN_KEY") {
            setQuestionInput(data.q);
            setAnswerInput(data.a);
            setNormal(false);
        }

        if (command === "EXIT_INSERT") {
            const copy: PageStack = pageStack.getShallowClone();
            currNode === "question"
                ? (data.q = questionInput)
                : (data.a = answerInput);

            const question: Question = QpvUtils.toQuestion(data);
            copy.top().data = question;
            copy.propagateChanges();
            Write.writeData(copy);
            setPageStack(copy);
            setNormal(true);
        }
    }

    const questionBorderColor: string = getBorderColor("question");
    const questionAcceptsInput: boolean = acceptsInput("question");
    const answerBorderColor: string = getAnswerBorderColor();
    const answerAcceptsInput: boolean = acceptsInput("answer");

    useKeyBinds(handleKeyBinds, normal);

    return {
        questionBorderColor,
        questionAcceptsInput,
        answerBorderColor,
        answerAcceptsInput,
        currNode,
        questionInput,
        setQuestionInput,
        answerInput,
        setAnswerInput,
        data,
    };
}
