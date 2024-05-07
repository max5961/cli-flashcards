import { useContext, useEffect, useState } from "react";
import { NormalContext } from "../App.js";
import { PageContext, QpvContext } from "../components/create/Pages.js";
import { QpvNode, QpvUtils } from "../utils/QpvUtils.js";
import { Command } from "../utils/KeyBinds.js";
import { PageStack } from "../utils/PageStack.js";
import { Question } from "../types.js";
import { Write } from "../utils/Write.js";
import { useKeyBinds } from "./useKeyBinds.js";

export function useQABox() {
    const { normal, setNormal } = useContext(NormalContext)!;
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

    function getAnswerBorderColor(): string {
        if (data.type !== "mc") return getBorderColor("answer");

        const possibleValues: string[] = [];
        for (let i = 0; i < data.choices.length; ++i) {
            possibleValues.push(String.fromCharCode(65 + i));
        }

        if (
            !possibleValues.includes(answerInput) &&
            !possibleValues.includes(data.a)
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

        if (command === "ENTER_INSERT") {
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
            copy.getShallowClone();
            Write.writeData(copy);
            setPageStack(copy);
            setNormal(true);
        }
    }

    const questionBorderColor: string = getBorderColor("question");
    const questionAcceptsInput: boolean = acceptsInput("question");
    const answerBorderColor: string = getAnswerBorderColor();
    const answerAcceptsInput: boolean = acceptsInput("answer");

    useKeyBinds(handleKeyBinds);

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
