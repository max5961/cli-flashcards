import { useContext, useRef, useState } from "react";
import { AppContext } from "../../App.js";
import { PageContext } from "../EditQuizzesView.js";
import { FlexibleQuestion } from "../../types.js";
import { QpvHandler, QpvNode, QpvUtils } from "../utils/QpvUtils.js";
import { useNav } from "../../shared/hooks/useNav.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";
import { Command } from "../../shared/utils/KeyBinds.js";
import { Write } from "../../shared/utils/Write.js";

export function useQpv() {
    const { normal, setNormal } = useContext(AppContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;

    const defaultData: FlexibleQuestion = QpvUtils.getFlexibleData(pageStack);
    const [data, setData] = useState<FlexibleQuestion>(defaultData);

    // used for reverting changes
    const initialData = useRef<FlexibleQuestion>(defaultData);

    const { nav, currNode, setCurrNode } = useNav<QpvNode, FlexibleQuestion>(
        data,
        QpvUtils.getNavInit,
    );

    const qpvHandler = new QpvHandler({
        data,
        setData,
        pageStack,
        setPageStack,
        normal,
        setNormal,
        nav,
        currNode,
        setCurrNode,
    });

    // The for basic movements. Sub-components of QuestionPageView will handle
    // modifying and writing data
    function handleKeyBinds(command: Command | null): void {
        if (!command) return;

        if (command === "UP") {
            qpvHandler.handleMove("UP");
        }

        if (command === "DOWN") {
            qpvHandler.handleMove("DOWN");
        }

        if (command === "RIGHT") {
            qpvHandler.handleMove("RIGHT");
        }

        if (command === "LEFT") {
            qpvHandler.handleMove("LEFT");
        }

        if (command === "DELETE_KEY") {
            qpvHandler.backPrevPage();
        }

        if (currNode === "cancel" && command === "RETURN_KEY") {
            const pageStackCopy = pageStack.getShallowClone();
            const questionCopy = QpvUtils.toQuestion(initialData.current);
            pageStackCopy.top().data = questionCopy;
            pageStackCopy.propagateChanges();

            setPageStack(pageStackCopy);
            setData(initialData.current);
            Write.writeData(pageStackCopy);
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    return {
        normal,
        data,
        currNode,
        setCurrNode,
        setData,
        pageStack,
        setPageStack,
    };
}
