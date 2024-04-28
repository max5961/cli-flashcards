import { QuizFileData, Section, Question, QuizData } from "../../interfaces.js";
import fs from "node:fs";
import os from "os";
import path from "path";

type ListItems = QuizFileData[] | Section[] | Question[];
type PageData = QuizData | QuizFileData | Section | Question;
type PageType = "QUIZZES" | "SECTIONS" | "QUESTIONS" | "QUESTION";

class Page {
    public pageData: PageData;
    public pageType: PageType | null;
    public prev: Page | null;
    public next: Page | null;

    public listItems: ListItems | null;
    public title: string | null;
    public addItemText: string | null;
    public getDesc: (() => (index: number, listItems: any[]) => string) | null;

    constructor(pageData: PageData, pageType: PageType) {
        this.pageData = pageData;
        this.pageType = pageType;
        this.prev = null;
        this.next = null;

        this.listItems = null;
        this.title = null;
        this.addItemText = null;
        this.getDesc = null;

        this.buildPage();
    }

    buildPage(): void {
        if (this.pageType === "QUIZZES") {
            const quizzes: QuizFileData[] = (this.pageData as QuizData).quizzes;
            this.listItems = quizzes;
            this.title = "All Quizzes";
            this.addItemText = "Add Quiz";
            this.getDesc = () => {
                return (index: number, listItems: any[]) => {
                    return (listItems[index] as QuizFileData).fileName;
                };
            };
            return;
        }

        if (this.pageType === "SECTIONS") {
            const sections: Section[] = (this.pageData as QuizFileData).quiz
                .sections;
            this.listItems = sections;
            // this.title = "All Sections";
            this.title = `Sections in: ${this.prev!.title}`;
            this.addItemText = "Add Section";
            this.getDesc = () => {
                return (index: number, listItems: any[]) => {
                    return (listItems[index] as Section).name;
                };
            };
        }

        if (this.pageType === "QUESTIONS") {
            const questions: Question[] = (this.pageData as Section).questions;
            this.listItems = questions;
            this.title = "All Questions";
            this.addItemText = `Questions in: ${this.prev!.prev!.title} -> ${this.prev!.title}`;
            this.getDesc = () => {
                return (index: number, listItems: any[]) => {
                    return (listItems[index] as Question).q;
                };
            };
        }
    }
}

export class PageStack {
    private head: Page | null;
    private tail: Page | null;

    constructor(pageData: PageData, pageType: PageType) {
        this.head = null;
        this.tail = null;
        this.append(pageData, pageType);
    }

    append(page: PageData, pageType: PageType): void {
        const newPage = new Page(page, pageType);

        if (!this.head || !this.tail) {
            this.head = newPage;
            this.tail = newPage;
            return;
        }

        const prevHead = this.head;
        prevHead.next = newPage;
        newPage.prev = prevHead;
        this.head = newPage;
    }

    top(): Page | null {
        return this.head;
    }

    pop(): void {
        if (!this.head) {
            return;
        }

        const newHead: Page | null = this.head.prev;
        this.head = newHead;

        if (!this.head) {
            this.tail = this.head;
        }
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
            this.append(nextPageData, "SECTIONS");
        } else if (currPage.pageType === "SECTIONS") {
            this.append(nextPageData, "QUESTIONS");
        } else if (currPage.pageType === "QUESTIONS") {
            this.append(nextPageData, "QUESTION");
        }
    }
}

class Write {
    static getPath() {
        //
    }
}
