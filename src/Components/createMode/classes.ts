import { QuizFileData, Section, Question, QuizData } from "../../interfaces.js";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { QuestionData, QuestionUtils } from "./QuestionUtils.js";

type ListItems = QuizFileData[] | Section[] | Question[];
// type PageData = QuizData | QuizFileData | Section | Question;
type PageType = "QUIZZES" | "SECTIONS" | "QUESTIONS" | "QUESTION";

export class Page {
    public pageType: PageType;
    public prev: Page | null;
    public next: Page | null;

    public listItems: ListItems | null;
    public title: string | null;
    public addItemText: string | null;
    public getDesc: ((index: number) => string) | null;

    public lastIndex: number;

    // can reduce the pageData to just listItems which also makes cloning much much easier
    // and should not effect the get next page method
    constructor(listItems: ListItems, pageType: PageType) {
        this.prev = null;
        this.next = null;

        this.pageType = pageType;
        this.listItems = listItems;
        this.title = null;
        this.addItemText = null;
        this.getDesc = null;

        this.lastIndex = 0;
    }

    buildPage(): void {
        if (this.pageType === "QUIZZES") {
            this.title = "All Quizzes";
            this.addItemText = "Add Quiz";
            this.getDesc = (index: number) => {
                return (this.listItems![index] as QuizFileData).fileName;
            };
            return;
        }

        if (this.pageType === "SECTIONS") {
            let fileName: string = "unknown filename";
            if (this.prev) {
                fileName = this.prev.getDesc!(this.prev.lastIndex!);
            }

            this.title = `Sections in: ${fileName}`;
            this.addItemText = "Add Section";
            this.getDesc = (index: number) => {
                return (this.listItems![index] as Section).name;
            };
            return;
        }

        if (this.pageType === "QUESTIONS") {
            let fileName: string = "unknown filename";
            let sectionName: string = "unknown section";
            if (this.prev) {
                sectionName = this.prev.getDesc!(this.prev.lastIndex!);
                if (this.prev.prev) {
                    fileName = this.prev.prev.getDesc!(
                        this.prev.prev.lastIndex!,
                    );
                }
            }

            this.title = `Questions in: ${fileName} -> ${sectionName}`;
            this.addItemText = "Add Question";
            this.getDesc = (index: number) => {
                return (this.listItems![index] as Question).q;
            };
            return;
        }

        // If pageType is "QUESTION" do nothing.  It doesn't need any of the above
        // data
    }
}

export class PageStack {
    private head: Page | null;
    private tail: Page | null;
    private size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    top(): Page | null {
        return this.head;
    }

    bottom(): Page | null {
        return this.tail;
    }

    pop(): void {
        // always want to have at least one Page in the stack
        if (!this.head || this.size <= 1) {
            return;
        }

        const newHead: Page | null = this.head.prev;
        this.head = newHead;

        if (!this.head) {
            this.tail = this.head;
        } else {
            this.head.next = null;
        }

        --this.size;
    }

    append(listItems: ListItems, pageType: PageType): void {
        const newPage = new Page(listItems, pageType);
        if (!this.head || !this.tail) {
            this.head = newPage;
            this.tail = newPage;
        } else {
            const prevHead = this.head;
            prevHead.next = newPage;
            newPage.prev = prevHead;
            this.head = newPage;
        }

        // can only build the page once it knows its prev pointers
        newPage.buildPage();
        ++this.size;
    }

    appendNextPage(currIndex: number): void {
        if (!this.head || !this.tail) {
            throw new Error(
                "Can only call appendNextPage on a non-empty PageStack",
            );
        }

        const currPage: Page = this.top()!;
        const nextPageData = currPage.listItems![currIndex];

        if (currPage.pageType === "QUIZZES") {
            const listItems = (nextPageData as QuizFileData).quiz.sections;
            this.append(listItems, "SECTIONS");
        } else if (currPage.pageType === "SECTIONS") {
            const listItems = (nextPageData as Section).questions;
            this.append(listItems, "QUESTIONS");
        } else if (currPage.pageType === "QUESTIONS") {
            this.append([], "QUESTION");
        }
    }

    shallowClone(): PageStack {
        const pageStackCopy = new PageStack();
        let curr: Page | null = this.tail;

        while (curr) {
            pageStackCopy.append(curr.listItems!, curr.pageType);
            pageStackCopy.top()!.lastIndex = curr.lastIndex;
            curr = curr.next;
        }

        return pageStackCopy;
    }
}

type SetPageStack = (ps: PageStack) => void;

export class Update {
    private directory: string;
    private pageStack: PageStack;
    private setPageStack: SetPageStack;
    private page: Page;

    constructor(pageStack: PageStack, setPageStack: SetPageStack) {
        this.pageStack = pageStack;
        this.setPageStack = setPageStack;
        this.page = pageStack.top()!;
        this.directory = this.getDirectory();
    }

    getDirectory(): string {
        return path.join(os.homedir(), ".local", "share", "flashcards");
    }

    async clearDirectory(): Promise<void> {
        try {
            const files: string[] = await fs.readdir(this.directory);
            for (const file of files) {
                const filePath = path.join(this.directory, file);
                fs.unlink(filePath);
            }
        } catch (err: any) {
            console.error(err.message);
        }
    }

    async writeData(): Promise<void> {
        await this.clearDirectory();

        if (!this.pageStack.bottom() || !this.pageStack.bottom()!.listItems) {
            throw new Error("Page is null or list is null");
        }

        const files: QuizFileData[] = this.pageStack.bottom()!
            .listItems! as QuizFileData[];

        try {
            for (const fileData of files) {
                const json: string = JSON.stringify(fileData.quiz, null, 4);
                const fileName: string = fileData.fileName;
                const filePath: string = path.join(this.directory, fileName);

                await fs.writeFile(filePath, json, "utf-8");
            }
        } catch (err: any) {
            console.error(err.message);
        }
    }

    updateQuestion(updatedQuestion: QuestionData): void {
        const convertedUpdatedQuestion: Question =
            QuestionUtils.toQuestion(updatedQuestion);

        if (this.pageStack.top()!.pageType !== "QUESTION") {
            throw new Error("Can only update question on question page");
        }

        const pageStackCopy: PageStack = this.pageStack.shallowClone();
        const lastPage: Page = pageStackCopy.top()!.prev!;
        const lastPageIndex: number = lastPage.lastIndex;

        lastPage.listItems![lastPageIndex] = convertedUpdatedQuestion;
        this.pageStack = pageStackCopy;
        this.setPageStack(pageStackCopy);
    }

    async handleUpdateQuestion(updatedQuestion: QuestionData): Promise<void> {
        this.updateQuestion(updatedQuestion);
        await this.writeData();
    }

    updateName(newName: string, index: number): void {
        if (!this.page.listItems) {
            throw new Error("List items is null");
        }

        const pageStackCopy = this.pageStack.shallowClone();

        if (this.page.pageType === "QUIZZES") {
            const quizzes = pageStackCopy.top()!.listItems as QuizFileData[];

            quizzes[index] = {
                ...quizzes[index],
                fileName: newName,
            };
        } else if (this.page.pageType === "SECTIONS") {
            const sections = pageStackCopy.top()!.listItems as Section[];

            sections[index] = {
                ...sections[index],
                name: newName,
            };
        } else if (this.page.pageType === "QUESTIONS") {
            const questions = pageStackCopy.top()!.listItems as Question[];

            questions[index] = {
                ...questions[index],
                q: newName,
            };
        }

        this.setPageStack(pageStackCopy);
        this.pageStack = pageStackCopy;
    }

    addNew(newName: string): void {
        const pageStackCopy = this.pageStack.shallowClone();

        if (this.page.pageType === "QUIZZES") {
            const quizzes = this.page.listItems! as QuizFileData[];
            quizzes.push({
                fileName: newName,
                quiz: {
                    sections: [],
                },
            });
        } else if (this.page.pageType === "SECTIONS") {
            const sections = this.page.listItems! as Section[];
            sections.push({
                name: newName,
                questions: [],
            });
        } else if (this.page.pageType === "QUESTIONS") {
            const questions = this.page.listItems! as Question[];
            questions.push({
                q: "",
                a: "",
                type: "qa",
            });
        }

        pageStackCopy.top()!.lastIndex = this.page.listItems!.length - 1;
        this.pageStack = pageStackCopy;

        // go right into Question page if adding a question
        if (this.page.pageType === "QUESTIONS") {
            pageStackCopy.appendNextPage(this.page.listItems!.length - 1);
        }

        this.setPageStack(pageStackCopy);
    }

    removeListItem(index: number): void {
        const pageStackCopy = this.pageStack.shallowClone();

        if (!pageStackCopy.top()!.listItems) {
            throw new Error("List items is null");
        }

        pageStackCopy.top()!.listItems!.splice(index, 1);
        pageStackCopy.top()!.lastIndex = index;

        this.pageStack = pageStackCopy;
        this.setPageStack(pageStackCopy);
    }

    async handleRemove(index: number): Promise<void> {
        this.removeListItem(index);
        await this.writeData();
    }

    async handleAdd(newName: string): Promise<void> {
        this.addNew(newName);
        await this.writeData();
    }

    async handleEdit(newName: string, index: number): Promise<void> {
        this.updateName(newName, index);
        await this.writeData();
    }
}

export class Opt<T> {
    public name: T;
    public left: Opt<T> | null;
    public right: Opt<T> | null;
    public up: Opt<T> | null;
    public down: Opt<T> | null;

    constructor(name: T) {
        this.name = name;
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
    }

    linkUp(toLink: Opt<T>): void {
        this.up = toLink;
    }

    linkDown(toLink: Opt<T>): void {
        this.down = toLink;
    }

    linkLeft(toLink: Opt<T>): void {
        this.left = toLink;
    }

    linkRight(toLink: Opt<T>): void {
        this.right = toLink;
    }
}

export class Nav<T> {
    private curr: Opt<T>;
    private optMap: Map<T, Opt<T>> = new Map();

    constructor(navConfig: (n: Nav<T>) => Opt<T>) {
        this.curr = navConfig(this);
    }

    addNode(name: T): Opt<T> {
        this.optMap.set(name, new Opt(name));
        return this.optMap.get(name)!;
    }

    moveUp(): void {
        if (this.curr.up) {
            this.curr = this.curr.up;
        }
    }

    moveDown(): void {
        if (this.curr.down) {
            this.curr = this.curr.down;
        }
    }

    moveLeft(): void {
        if (this.curr.left) {
            this.curr = this.curr.left;
        }
    }

    moveRight(): void {
        if (this.curr.right) {
            this.curr = this.curr.right;
        }
    }

    goTo(name: T): void {
        if (this.optMap.has(name)) {
            this.curr = this.optMap.get(name)!;
        } else {
            throw new Error(`name: ${name} is not part of navigation map`);
        }
    }

    getCurr(): T {
        return this.curr.name;
    }

    returnIfValid(name: T): T | null {
        if (this.optMap.has(name)) {
            return name;
        } else {
            return null;
        }
    }
}
