import { useContext, useRef, useState } from "react";
import { NormalContext } from "../App.js";
import { PageContext } from "../components/create/Pages.js";
import { FlexibleQuestion } from "../types.js";
import { QpvHandler, QpvNode, QpvUtils } from "../utils/QpvUtils.js";
import { useNav } from "./useNav.js";
import { useKeyBinds } from "./useKeyBinds.js";
import { Command } from "../utils/KeyBinds.js";
import { Write } from "../utils/Write.js";

export function useQpv() {
    const { normal, setNormal } = useContext(NormalContext)!;
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
            pageStackCopy.getShallowClone();

            setData(initialData.current);

            Write.writeData(pageStackCopy);
        }
    }

    useKeyBinds(handleKeyBinds);

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
