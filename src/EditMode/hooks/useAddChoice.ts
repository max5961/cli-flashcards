import { useContext, useState } from "react";
import { AppContext } from "../../App.js";
import { PageContext, QpvContext } from "../EditModeView.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";
import { Command } from "../../shared/utils/KeyBinds.js";
import { PageStack } from "../../shared/utils/PageStack.js";
import { FlexibleQuestion } from "../../types.js";
import { QpvUtils } from "../utils/QpvUtils.js";
import { Write } from "../../shared/utils/Write.js";

export function useAddChoice() {
    const { normal, setNormal } = useContext(AppContext)!;
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
            pageStackCopy.propagateChanges();

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

    useKeyBinds(handleKeyBinds, normal);

    return { isFocus, acceptsInput, edit, setEdit };
}
