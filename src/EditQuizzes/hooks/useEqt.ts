import { useContext } from "react";
import { QpvContext } from "../EditQuizzesView.js";
import { Command } from "../../shared/utils/KeyBinds.js";
import { QpvUtils } from "../utils/QpvUtils.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";
import { FlexibleQuestion } from "../../types.js";
import { Write } from "../../shared/utils/Write.js";

export function useEqt() {
    const { currNode, data, setData, pageStack, setPageStack } =
        useContext(QpvContext)!;

    function isWithin(): boolean {
        return currNode === "qa" || currNode === "qi" || currNode === "mc";
    }

    function handleKeyBinds(command: Command | null): void {
        if (command !== "RETURN_KEY") {
            return;
        }

        if (currNode !== "qa" && currNode !== "qi" && currNode !== "mc") {
            return;
        }

        const questionCopy: FlexibleQuestion =
            QpvUtils.cloneFlexibleQuestion(data);
        questionCopy.type = currNode;
        setData(questionCopy);

        const pageStackCopy = pageStack.getShallowClone();
        pageStackCopy.top().data = QpvUtils.toQuestion(questionCopy);
        pageStackCopy.getShallowClone();
        Write.writeData(pageStackCopy);
        setPageStack(pageStackCopy);
    }

    useKeyBinds(handleKeyBinds);

    return isWithin();
}
