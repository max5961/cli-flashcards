import { useContext, useEffect, useState } from "react";
import { NormalContext } from "../App.js";
import { PageContext, QpvContext } from "../components/create/Pages.js";
import { Command } from "./KeyBinds.js";
import { FlexibleQuestion, McChoice } from "../types.js";
import { useKeyBinds } from "../hooks/useKeyBinds.js";
import { QpvUtils } from "./QpvUtils.js";
import { PageStack } from "./PageStack.js";
import { Write } from "./Write.js";

export function useMcText(index: number) {
    const { normal, setNormal } = useContext(NormalContext)!;
    const { data, setData, currNode } = useContext(QpvContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;
    const [edit, setEdit] = useState<string>("");

    useEffect(() => {
        setEdit(data.choices[index]);
    }, [pageStack]);

    function getLabel(index: number): string {
        return String.fromCharCode(65 + index);
    }

    const acceptsInput: boolean = !normal && getLabel(index) === currNode;
    const defaultText: string = data.choices[index];

    function handleKeyBinds(command: Command | null): void {
        const label: McChoice = getLabel(index) as McChoice;
        if (currNode !== label) {
            return;
        }

        if (command === "CLEAR") {
            setEdit("");
            setNormal(false);
        }

        if (command === "ENTER_INSERT") {
            setNormal(false);
        }

        if (command === "EXIT_INSERT") {
            const dataCopy: FlexibleQuestion =
                QpvUtils.cloneFlexibleQuestion(data);
            dataCopy.choices[index] = edit;

            const pageStackCopy: PageStack = pageStack.getShallowClone();
            pageStackCopy.top().data = QpvUtils.toQuestion(dataCopy);
            pageStackCopy.getShallowClone();
            setPageStack(pageStackCopy);
            setData(dataCopy);
            setNormal(true);

            Write.writeData(pageStackCopy);
        }
    }

    useKeyBinds(handleKeyBinds);

    return { acceptsInput, edit, setEdit, defaultText };
}
