import { ListPage, PageStack } from "./PageStack.js";

type SPS = (ps: PageStack) => void;
type SI = (n: number) => void;

export class LpvUtil {
    private stack!: PageStack;
    private setStack!: SPS;
    private index!: number;
    private setIndex!: SI;
    private maxIndex!: number;
    private normal!: boolean;
    private setNormal!: (b: boolean) => void;

    buildStack(stack: PageStack): void {
        this.stack = stack;
    }

    buildSetStack(setStack: SPS): void {
        this.setStack = setStack;
    }

    buildIndex(index: number): void {
        this.index = index;
    }

    buildSetIndex(setIndex: SI): void {
        this.setIndex = setIndex;
    }

    buildMaxIndex(maxIndex: number): void {
        this.maxIndex = maxIndex;
    }

    buildNormal(normal: boolean): void {
        this.normal = normal;
    }

    buildSetNormal(setNormal: (b: boolean) => void): void {
        this.setNormal = setNormal;
    }

    getStackCopy(): PageStack {
        return this.stack.getShallowClone();
    }

    moveUp(): void {
        if (this.index <= 0) {
            return;
        }
        this.setIndex(this.index - 1);
    }

    moveDown(): void {
        if (this.index >= this.maxIndex) {
            return;
        }
        this.setIndex(this.index + 1);
    }

    enterNextPage(index: number): void {
        if (index >= this.maxIndex) {
            return;
        }

        const copy = this.getStackCopy();
        copy.appendNextPage(index);
        this.setStack(copy);
    }

    backPrevPage(): void {
        if (this.stack.top().pageType === "QUIZZES") {
            return;
        }

        const copy = this.getStackCopy();
        copy.pop();
        this.setStack(copy);
    }

    removeListItem(index: number): void {
        if (index >= this.maxIndex) {
            return;
        }

        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.removeListItem(index);

        // need to clone again for changes to propagate backwards
        this.setStack(copy.getShallowClone());
    }

    setListItemName(index: number, newName: string): void {
        if (index >= this.maxIndex) {
            return;
        }

        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.setListItemName(index, newName);

        this.setStack(copy.getShallowClone());
    }

    addListItem(name: string): void {
        const copy: PageStack = this.getStackCopy();
        const top: ListPage = copy.top() as ListPage;
        top.addListItem(name);

        this.setStack(copy.getShallowClone());
    }

    enterInsert(index: number): void {
        if (index >= this.maxIndex) {
            return;
        }

        this.setNormal(false);
    }

    enterNormal(): void {
        this.setNormal(true);
    }
}
