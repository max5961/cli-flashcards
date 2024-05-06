import { LpvUtil } from "../utils/LpvUtil.js";
import { useContext, useEffect, useState } from "react";
import { ListPage } from "../utils/PageStack.js";
import { useWindow } from "./useWindow.js";
import { PageContext } from "../components/create/Pages.js";
import { NormalContext } from "../App.js";
import { useKeyBinds } from "./useKeyBinds.js";
import { Command } from "../utils/KeyBinds.js";
import { Write } from "../utils/Write.js";

export function useLpv() {
    const { normal, setNormal } = useContext(NormalContext)!;
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
    });

    const handleKeyBinds = (command: Command | null) => {
        if (!command) return;

        if (command === "DOWN") {
            lpvUtil.moveDown();
        }

        if (command === "UP") {
            lpvUtil.moveUp();
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
    };

    useKeyBinds(handleKeyBinds);

    return { page, edit, setEdit, window, currIndex, normal };
}
