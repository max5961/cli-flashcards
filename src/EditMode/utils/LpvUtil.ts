import { WhichMode } from "../../App.js";
import { Write } from "../../shared/utils/Write.js";
import { ListPage, PageStack } from "../../shared/utils/PageStack.js";

interface State {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
    page: ListPage;
    currIndex: number;
    setCurrIndex: (n: number) => void;
    normal: boolean;
    setNormal: (b: boolean) => void;
    edit: string;
    setEdit: (s: string) => void;
    setMode: (m: WhichMode) => void;
}

export class LpvUtil {
    // State
    private pageStack!: PageStack;
    private setPageStack!: (ps: PageStack) => void;
    private page!: ListPage;
    private currIndex!: number;
    private setCurrIndex!: (n: number) => void;
    private normal!: boolean;
    private setNormal!: (b: boolean) => void;
    private edit!: string;
    private setEdit!: (s: string) => void;
    private setMode!: (m: WhichMode) => void;

    private maxIndex: number;

    constructor(state: State) {
        Object.assign(this, state);
        this.maxIndex = this.getMaxIndex();
    }

    getMaxIndex(): number {
        return this.page.listItems.length;
    }

    getStackCopy(): PageStack {
        return this.pageStack.getShallowClone();
    }

    writeData(copy: PageStack): void {
        copy.propagateChanges();
        this.setPageStack(copy);
        Write.writeData(copy);
    }

    moveUp(): void {
        if (this.currIndex <= 0) {
            return;
        }

        this.setCurrIndex(this.currIndex - 1);
    }

    moveDown(): void {
        if (this.currIndex >= this.maxIndex) {
            return;
        }
        this.setCurrIndex(this.currIndex + 1);
    }

    handleReturnKey(): void {
        if (this.currIndex >= this.maxIndex) {
            if (this.page.pageType === "SECTION") {
                this.createQuestionAndEnter();
            } else {
                this.enterInsert();
            }
        } else {
            this.enterNextPage();
        }
    }

    createQuestionAndEnter(): void {
        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.addListItem(this.edit);
        copy.appendNextPage(this.currIndex);
        copy.propagateChanges();
        Write.writeData(copy);
        this.setPageStack(copy);
    }

    enterNextPage(): void {
        const copy: PageStack = this.getStackCopy();
        copy.appendNextPage(this.currIndex);
        this.setPageStack(copy);
    }

    backPrevPage(): void {
        // no more pages to go back to
        if (this.pageStack.top().pageType === "QUIZZES") {
            this.setMode("START");
            return;
        }

        const copy = this.getStackCopy();
        copy.pop();
        this.setPageStack(copy);
    }

    enterInsert(): void {
        // by default, do not clear previous text.  enterInsertClear will make
        // sure data is clear when editing text
        if (this.currIndex < this.maxIndex) {
            const prevText: string = this.page.getItemDesc(this.currIndex);
            this.setEdit(prevText);
        }
        this.setNormal(false);
    }

    enterInsertClear(): void {
        this.setEdit("");
        this.setNormal(false);
    }

    deleteListItem(): void {
        if (this.currIndex >= this.maxIndex) {
            return;
        }

        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.removeListItem(this.currIndex);

        this.writeData(copy);
    }

    setListItemName(): void {
        if (this.currIndex >= this.maxIndex) {
            return;
        }

        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.setListItemName(this.currIndex, this.edit);

        this.writeData(copy);
    }

    addListItem(): void {
        if (this.edit === "") return;

        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.addListItem(this.edit);

        this.writeData(copy);
    }

    handleEnterNormal(): void {
        this.setNormal(true);

        if (this.currIndex >= this.maxIndex) {
            if (this.page.pageType === "SECTION") {
                this.createQuestionAndEnter();
            } else {
                this.addListItem();
            }
        } else {
            this.setListItemName();
        }

        this.setEdit("");
    }
}
