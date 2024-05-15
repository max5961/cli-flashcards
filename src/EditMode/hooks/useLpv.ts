import { LpvUtil } from "../utils/LpvUtil.js";
import { useContext, useEffect, useState } from "react";
import { ListPage } from "../../shared/utils/PageStack.js";
import { useWindow } from "../../shared/hooks/useWindow.js";
import { PageContext } from "../EditModeView.js";
import { AppContext } from "../../App.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";
import { Command } from "../../shared/utils/KeyBinds.js";

export function useLpv() {
    const { normal, setNormal, setMode } = useContext(AppContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;
    const [edit, setEdit] = useState<string>("");
    const { window, currIndex, setCurrIndex } = useWindow(5);

    useEffect(() => {
        setCurrIndex(page.lastIndex);
    }, [pageStack]);

    const page: ListPage = pageStack.top() as ListPage;

    const lpvUtil: LpvUtil = new LpvUtil({
        pageStack,
        setPageStack,
        page,
        currIndex,
        setCurrIndex,
        normal,
        setNormal,
        edit,
        setEdit,
        setMode,
    });

    function handleKeyBinds(command: Command | null): void {
        if (!command) return;

        if (command === "DOWN") {
            lpvUtil.moveDown();
        }

        if (command === "UP") {
            lpvUtil.moveUp();
        }

        if (command === "GO_TO_TOP") {
            setCurrIndex(0);
        }

        if (command === "GO_TO_BOTTOM") {
            setCurrIndex(page.listItems.length);
        }

        // either enter next page, or enter insert to add a new item
        if (command === "RETURN_KEY") {
            lpvUtil.handleReturnKey();
        }

        if (command === "DELETE_KEY") {
            lpvUtil.backPrevPage();
        }

        if (command === "DELETE") {
            lpvUtil.deleteListItem();
        }

        if (command === "ENTER_INSERT") {
            lpvUtil.enterInsert();
        }

        if (command === "CLEAR") {
            lpvUtil.enterInsertClear();
        }

        // either updates the name of a list item or adds a new list item
        // depending on current index location in UI
        if (command === "EXIT_INSERT") {
            lpvUtil.handleEnterNormal();
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    return { page, edit, setEdit, window, currIndex, normal };
}
