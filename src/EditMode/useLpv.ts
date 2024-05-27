import { useContext, useEffect, useState } from "react";
import { ListPage, PageStack } from "../shared/utils/PageStack.js";
import { useWindow } from "../shared/hooks/useWindow.js";
import { PageContext } from "./EditModeView.js";
import { AppContext, WhichMode } from "../App.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { Write } from "../shared/utils/Write.js";

interface LpvState {
    normal: boolean;
    currIndex: number;
    edit: string;
    message: string;
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
    setMode: (m: WhichMode) => void;
}

export function useLpv() {
    const { setMode } = useContext(AppContext)!;
    const { pageStack, setPageStack } = useContext(PageContext)!;
    const { window, currIndex } = useWindow(5);
    const [state, setState] = useState({
        normal: true,
        edit: "",
        message: "",
        currIndex: currIndex,
        pageStack: pageStack,
        setPageStack: setPageStack,
        setMode: setMode,
    });

    function setEdit(s: string): void {
        setState({
            ...state,
            edit: s,
        });
    }

    const page: ListPage = pageStack.top() as ListPage;

    useEffect(() => {
        setState({ ...state, currIndex: page.lastIndex });
    }, [pageStack]);

    const {
        handleMoveDown,
        handleMoveUp,
        handleReturnKey,
        handlePrevPage,
        handleDeleteItem,
        handleEnterInsert,
        handleClearText,
        handleExitInsert,
    } = useLpvHandlers(page, setPageStack);

    function handleKeyBinds(command: Command | null): void {
        if (!command && !state.message.length) return;

        let stateCopy: LpvState = { ...state };
        if (state.message.length) {
            stateCopy = { ...state };
            stateCopy.message = "";
        }

        if (!command) return;

        if (command === "DOWN") {
            handleMoveDown(stateCopy);
        }

        if (command === "UP") {
            handleMoveUp(stateCopy);
        }

        if (command === "GO_TO_TOP_OF_LIST") {
            stateCopy.currIndex = 0;
        }

        if (command === "GO_TO_BOTTOM_OF_LIST") {
            stateCopy.currIndex = page.listItems.length;
        }

        // either enter next page, or enter insert to add a new item
        if (command === "RETURN_KEY") {
            handleReturnKey(stateCopy);
        }

        if (command === "PREV_PAGE") {
            handlePrevPage(stateCopy);
        }

        if (command === "DELETE_ITEM") {
            handleDeleteItem(stateCopy);
        }

        if (command === "ENTER_INSERT") {
            handleEnterInsert(stateCopy);
        }

        if (command === "CLEAR_TEXT") {
            handleClearText(stateCopy);
        }

        // either updates the name of a list item or adds a new list item
        // depending on current index location in UI
        if (command === "EXIT_INSERT") {
            handleExitInsert(stateCopy);
        }

        setState(stateCopy);
    }

    useKeyBinds(handleKeyBinds, state.normal);

    return { page, setEdit, window, state };
}

function useLpvHandlers(page: ListPage, setPageStack: (ps: PageStack) => void) {
    const dupNameMsg: string = "Name already exists!";

    // utility
    function getMaxIndex(): number {
        return page.listItems.length;
    }

    function getStackCopy(stateCopy: LpvState): PageStack {
        return stateCopy.pageStack.getShallowClone();
    }

    function isDuplicateName(top: ListPage, stateCopy: LpvState): boolean {
        return top.nameExists(stateCopy.edit, stateCopy.currIndex);
    }

    function applyStackChanges(stateCopy: LpvState): void {
        stateCopy.pageStack.propagateChanges();
        setPageStack(stateCopy.pageStack);
    }

    function writeStackChanges(stateCopy: LpvState): void {
        applyStackChanges(stateCopy);
        Write.writeData(stateCopy.pageStack);
    }

    // handlers
    function handleMoveUp(stateCopy: LpvState): void {
        if (stateCopy.currIndex <= 0) {
            return;
        }
        stateCopy.currIndex = stateCopy.currIndex - 1;
    }

    function handleMoveDown(stateCopy: LpvState): void {
        if (stateCopy.currIndex >= getMaxIndex()) {
            return;
        }
        stateCopy.currIndex = stateCopy.currIndex + 1;
    }

    function handleReturnKey(stateCopy: LpvState): void {
        // max index is the add button
        if (stateCopy.currIndex >= getMaxIndex()) {
            if (page.pageType === "SECTION") {
                handleExitInsert(stateCopy); // calls handleNewQuestion
            } else {
                handleEnterInsert(stateCopy);
            }
        } else {
            handleNextPage(stateCopy);
        }
    }

    function handleNextPage(stateCopy: LpvState): void {
        const stackCopy: PageStack = getStackCopy(stateCopy);
        stackCopy.appendNextPage(stateCopy.currIndex);
        stateCopy.pageStack = stackCopy;
        applyStackChanges(stateCopy);
    }

    function handlePrevPage(stateCopy: LpvState): void {
        // no more pages to go back to, go to start menu
        if (page.pageType === "QUIZZES") {
            stateCopy.setMode("START");
            return;
        }

        const stackCopy: PageStack = getStackCopy(stateCopy);
        stackCopy.pop();
        stateCopy.pageStack = stackCopy;
        applyStackChanges(stateCopy);
    }

    function handleEnterInsert(stateCopy: LpvState): void {
        // by default, do not clear previous text.  enterInsertClear will make
        // sure data is clear when editing text
        if (stateCopy.currIndex < getMaxIndex()) {
            const prevText: string = page.getItemDesc(stateCopy.currIndex);
            stateCopy.edit = prevText;
        } else {
            // adding new item
            stateCopy.edit = "";
        }

        stateCopy.normal = false;
    }

    function handleClearText(stateCopy: LpvState): void {
        stateCopy.edit = "";
        stateCopy.normal = false;
    }

    function handleDeleteItem(stateCopy: LpvState): void {
        if (stateCopy.currIndex >= getMaxIndex()) {
            return;
        }

        const stackCopy: PageStack = getStackCopy(stateCopy);
        const top: ListPage = stackCopy.top() as ListPage;
        top.removeListItem(stateCopy.currIndex);
        stateCopy.pageStack = stackCopy;

        writeStackChanges(stateCopy);
    }

    function handleExitInsert(stateCopy: LpvState): void {
        stateCopy.normal = true;
        if (stateCopy.currIndex >= getMaxIndex()) {
            if (page.pageType === "SECTION") {
                handleNewQuestion(stateCopy);
            } else {
                addListItem(stateCopy);
            }
        } else {
            setListItemName(stateCopy);
        }

        stateCopy.edit = "";
        writeStackChanges(stateCopy);
    }

    // handleExitInsert helper
    function setListItemName(stateCopy: LpvState): void {
        if (stateCopy.currIndex >= getMaxIndex()) {
            return;
        }

        const stackCopy: PageStack = getStackCopy(stateCopy);
        const top: ListPage = stackCopy.top() as ListPage;

        if (isDuplicateName(top, stateCopy)) {
            stateCopy.message = dupNameMsg;
            return;
        }

        top.setListItemName(stateCopy.currIndex, stateCopy.edit);
        stateCopy.pageStack = stackCopy;
    }

    // handleExitInsert helper
    function addListItem(stateCopy: LpvState): void {
        if (stateCopy.edit === "") return;

        const stackCopy: PageStack = getStackCopy(stateCopy);
        const top: ListPage = stackCopy.top() as ListPage;

        if (isDuplicateName(top, stateCopy)) {
            stateCopy.message = dupNameMsg;
            return;
        }

        top.addListItem(stateCopy.edit);
        stateCopy.pageStack = stackCopy;
    }

    // handleExitInsert helper
    function handleNewQuestion(stateCopy: LpvState): void {
        if (isDuplicateName(page, stateCopy)) {
            stateCopy.message = dupNameMsg;
            return;
        }

        const stackCopy: PageStack = getStackCopy(stateCopy);
        const top: ListPage = stackCopy.top() as ListPage;
        top.addListItem(stateCopy.edit);
        stackCopy.appendNextPage(stateCopy.currIndex);
        stackCopy.propagateChanges();
        stateCopy.pageStack = stackCopy;
    }

    return {
        handleMoveDown,
        handleMoveUp,
        handleReturnKey,
        handlePrevPage,
        handleDeleteItem,
        handleEnterInsert,
        handleClearText,
        handleExitInsert,
    };
}
