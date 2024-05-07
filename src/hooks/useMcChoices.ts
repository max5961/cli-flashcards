import { useContext } from "react";
import { PageContext, QpvContext } from "../components/create/Pages.js";
import { useKeyBinds } from "./useKeyBinds.js";
import { Command } from "../utils/KeyBinds.js";
import { McChoice } from "../types.js";
import { QpvUtils } from "../utils/QpvUtils.js";
import { Write } from "../utils/Write.js";

export function useMcChoices() {
    const { data, setData, currNode, setCurrNode } = useContext(QpvContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;

    const possibleChoices: McChoice[] = ["A", "B", "C", "D"];

    function getCurrNodeIndex(): number | null {
        for (let i = 0; i < possibleChoices.length; ++i) {
            if (currNode === possibleChoices[i]) {
                return i;
            }
        }

        return null;
    }

    function currNodeIsChoice(): boolean {
        for (let i = 0; i < possibleChoices.length; ++i) {
            if (currNode === possibleChoices[i]) {
                return true;
            }
        }
        return false;
    }

    // Can delete choices.  Modifying choices will be handled in a sub component
    function handleKeyBinds(command: Command | null): void {
        if (!currNodeIsChoice()) {
            return;
        }

        if (command === "DELETE") {
            const toSliceIndex: number | null = getCurrNodeIndex();
            if (toSliceIndex === null) {
                throw new Error("Cannot find index to remove from");
            }

            const pageStackCopy = pageStack.getShallowClone();
            const dataCopy = QpvUtils.cloneFlexibleQuestion(data);
            dataCopy.choices.splice(toSliceIndex, 1);
            pageStackCopy.top().data = dataCopy;
            pageStackCopy.getShallowClone();

            if (dataCopy.choices.length === 0) {
                setCurrNode("add");
            }

            setPageStack(pageStackCopy);
            setData(dataCopy);

            Write.writeData(pageStackCopy);
        }
    }

    useKeyBinds(handleKeyBinds);

    return { data, currNode };
}
