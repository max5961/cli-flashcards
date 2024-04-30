import { QuizFileData, Section, Question, QuizData } from "../../interfaces.js";
import fs from "fs/promises";
import os from "os";
import path from "path";

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
    private index: number;
    private directory: string;
    private pageStack: PageStack;
    private setPageStack: SetPageStack;
    private page: Page;

    constructor(
        index: number,
        pageStack: PageStack,
        setPageStack: SetPageStack,
    ) {
        this.index = index;
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

    cloneQuestion(question: Question): Question {
        if (question.type === "qa" || question.type === "qi") {
            return {
                ...question,
            };
        } else if (question.type === "mc") {
            const choicesCopy: any[] = [];
            for (const choice of question.choices) {
                choicesCopy.push({
                    ...choice,
                });
            }

            return {
                ...question,
                choices: [...choicesCopy],
            };
        }
        throw new Error("Invalid question type");
    }

    updateQuestion(updatedQuestion: Question): void {
        if (this.pageStack.top()!.pageType !== "QUESTION") {
            throw new Error("Can only update question on question page");
        }

        const pageStackCopy: PageStack = this.pageStack.shallowClone();
        const lastPage: Page = pageStackCopy.top()!.prev!;
        const lastPageIndex: number = lastPage.lastIndex;

        lastPage.listItems![lastPageIndex] = updatedQuestion;
        this.pageStack = pageStackCopy;
        this.setPageStack(pageStackCopy);
    }

    async handleUpdateQuestion(updatedQuestion: Question): Promise<void> {
        this.updateQuestion(updatedQuestion);
        await this.writeData();
    }

    updateName(newName: string): void {
        if (!this.page.listItems) {
            throw new Error("List items is null");
        }

        const pageStackCopy = this.pageStack.shallowClone();

        if (this.page.pageType === "QUIZZES") {
            const quizzes = pageStackCopy.top()!.listItems as QuizFileData[];

            quizzes[this.index] = {
                ...quizzes[this.index],
                fileName: newName,
            };
        } else if (this.page.pageType === "SECTIONS") {
            const sections = pageStackCopy.top()!.listItems as Section[];

            sections[this.index] = {
                ...sections[this.index],
                name: newName,
            };
        } else if (this.page.pageType === "QUESTIONS") {
            const questions = pageStackCopy.top()!.listItems as Question[];

            questions[this.index] = {
                ...questions[this.index],
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

    async handleEdit(newName: string): Promise<void> {
        this.updateName(newName);
        await this.writeData();
    }
}

class Opt {
    public name: string;
    public left: Opt | null;
    public right: Opt | null;
    public up: Opt | null;
    public down: Opt | null;

    constructor(name: string) {
        this.name = name;
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
    }
}

export class QuestionNav {
    private curr: Opt;

    constructor(mcList: any[]) {
        const qa: Opt = new Opt("qa");
        const qi: Opt = new Opt("qi");
        const mc: Opt = new Opt("mc");
        const question: Opt = new Opt("q");
        const answer: Opt = new Opt("a");
        const save: Opt = new Opt("save");
        const cancel: Opt = new Opt("cancel");

        // qa
        qa.down = qi;

        // qi
        qi.down = mc;
        qi.up = qa;

        // mc
        mc.up = qi;
        mc.down = question;

        // q
        question.up = mc;
        question.right = answer;
        question.down = save;

        // a
        answer.up = mc;
        answer.left = question;
        answer.down = save;

        // save
        save.up = question;
        save.right = cancel;

        // cancel
        cancel.up = answer;
        cancel.left = save;

        if (mcList.length) {
            this.buildMcList(mcList, save, cancel, question, answer);
        }

        // set curr pointer
        this.curr = question;
    }

    buildMcList(mcList: any[], save: Opt, cancel: Opt, q: Opt, a: Opt): void {
        const opts: Opt[] = [];
        const add: Opt = new Opt("add");

        for (let i = 0; i < mcList.length; ++i) {
            const name: string = String.fromCharCode(65 + i);
            const opt = new Opt(name);
            opts.push(opt);
        }

        for (let i = 0; i < opts.length; ++i) {
            if (i === 0) {
                q.down = opts[i];
                a.down = opts[i];
                opts[i].up = q;
            }

            if (opts[i + 1]) {
                opts[i].down = opts[i + 1];
            }

            if (opts[i - 1]) {
                opts[i].up = opts[i - 1];
            }

            if (i === opts.length - 1) {
                opts[i].down = add;
            }
        }

        if (opts.length) {
            add.up = opts[opts.length - 1];
        } else {
            add.up = q;
            q.down = add;
            a.down = add;
        }

        add.down = save;
        save.up = add;
        save.right = cancel;
        cancel.left = save;
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

    getCurr(): string {
        return this.curr.name;
    }
}
