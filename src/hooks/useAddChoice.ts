import { useContext, useState } from "react";
import { NormalContext } from "../App.js";
import { PageContext, QpvContext } from "../components/create/Pages.js";
import { useKeyBinds } from "./useKeyBinds.js";
import { Command } from "../utils/KeyBinds.js";
import { PageStack } from "../utils/PageStack.js";
import { FlexibleQuestion } from "../types.js";
import { QpvUtils } from "../utils/QpvUtils.js";
import { Write } from "../utils/Write.js";
import { QpvNode } from "../utils/QpvUtils.js";

export function useAddChoice() {
    const { normal, setNormal } = useContext(NormalContext)!;
    const { currNode, setCurrNode, data, setData } = useContext(QpvContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;
    const [edit, setEdit] = useState<string>("");

    const isFocus = currNode === "add";
    const acceptsInput = isFocus && !normal;

    function handleKeyBinds(command: Command | null): void {
        if (currNode !== "add") {
            return;
        }

        if (
            command === "CLEAR" ||
            command === "ENTER_INSERT" ||
            command === "RETURN_KEY"
        ) {
            setEdit("");
            setNormal(false);
        }

        if (command === "EXIT_INSERT") {
            const pageStackCopy: PageStack = pageStack.getShallowClone();
            const dataCopy: FlexibleQuestion =
                QpvUtils.cloneFlexibleQuestion(data);

            dataCopy.choices.push(edit);
            pageStackCopy.top().data = QpvUtils.toQuestion(dataCopy);
            pageStackCopy.getShallowClone();

            if (dataCopy.choices.length >= 4) {
                setCurrNode("D");
            }

            setData(dataCopy);
            setEdit("");
            setPageStack(pageStackCopy);
            setNormal(true);

            Write.writeData(pageStackCopy);
        }
    }

    useKeyBinds(handleKeyBinds);

    return { isFocus, acceptsInput, edit, setEdit };
}
