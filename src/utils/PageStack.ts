import { Quiz, Section, Question } from "../types.js";
type Data = Quiz[] | Quiz | Section | Question;
type PageType = "QUIZZES" | "QUIZ" | "SECTION" | "QUESTION";

export abstract class Page {
    public pageType: PageType;
    public data: Data;
    public prev: Page | null;
    public next: Page | null;
    public lastIndex: number;

    constructor(pageType: PageType, data: Data) {
        this.pageType = pageType;
        this.data = data;
        this.prev = null;
        this.next = null;
        this.lastIndex = 0;
    }
}

// QUIZZES | QUIZ | SECTION
export class ListPage extends Page {
    public title!: string;
    public addItemText!: string;
    public getItemDesc!: (index: number) => string;

    constructor(pageType: PageType, data: Data) {
        super(pageType, data);
        this.data = data;
    }

    buildPage(): void {
        // QUIZZES
        if (this.pageType === "QUIZZES") {
            this.title = "All Quizzes";
            this.addItemText = "Add Quiz";
            this.getItemDesc = (index: number) => {
                const quiz: Quiz = (this.data as Quiz[])[index];
                return quiz.fileName;
            };
            return;
        }

        // QUIZ
        if (this.pageType === "QUIZ") {
            if (!this.prev) {
                throw new Error("SECTIONS Page should have a previous Page");
            }

            const prev: ListPage = this.prev as ListPage;
            const fileName: string = prev.getItemDesc(prev.lastIndex);

            this.title = `Sections in: ${fileName}`;
            this.addItemText = "Add Section";
            this.getItemDesc = (index: number) => {
                const sections: Section[] = (this.data as Quiz).sections;
                return sections[index].name;
            };
            return;
        }

        // SECTION
        if (this.pageType === "SECTION") {
            if (!this.prev || !this.prev.prev) {
                throw new Error(
                    "QUESTIONS Page should have two previous Pages",
                );
            }

            const sections: ListPage = this.prev as ListPage;
            const quizzes: ListPage = this.prev.prev as ListPage;

            const sectionName = sections.getItemDesc(sections.lastIndex);
            const fileName = quizzes.getItemDesc(quizzes.lastIndex);

            this.title = `Questions in: ${fileName} -> ${sectionName}`;
            this.addItemText = "Add Question";
            this.getItemDesc = (index: number) => {
                const questions: Question[] = (this.data as Section).questions;
                return questions[index].q;
            };
            return;
        }
    }
}

// QUESTION
export class QuestionPage extends Page {
    constructor(pageType: PageType, data: Data) {
        super(pageType, data);
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

    append(pageType: PageType, data: Data): void {
        let newPage: Page;
        if (pageType === "QUESTION") {
            newPage = new QuestionPage(pageType, data);
        } else {
            newPage = new ListPage(pageType, data);
        }

        if (!this.head || !this.tail) {
            this.head = newPage;
            this.tail = newPage;
        } else {
            const prevHead = this.head;
            prevHead.next = newPage;
            newPage.prev = prevHead;
            this.head = newPage;
        }

        // can only build ListPage once it knows its prev pointers
        if (pageType !== "QUESTION") {
            (newPage as ListPage).buildPage();
        }
        ++this.size;
    }

    appendNextPage(currIndex: number): void {
        if (!this.head || !this.tail) {
            throw new Error(
                "Can only call appendNextPage on a non-empty PageStack",
            );
        }

        if (this.head.pageType === "QUESTION") {
            throw new Error("Cannot append more Pages to the QUESTION Page");
        }

        const top: ListPage = this.head as ListPage;

        if (top.pageType === "QUIZZES") {
            const quizzes: Quiz[] = top.data as Quiz[];
            const nextPageData = quizzes[currIndex];
            this.append("QUIZ", nextPageData);
        } else if (top.pageType === "QUIZ") {
            const sections: Section[] = (top.data as Quiz).sections;
            const nextPageData = sections[currIndex];
            this.append("SECTION", nextPageData);
        } else if (top.pageType === "SECTION") {
            const questions: Question[] = (top.data as Section).questions;
            const nextPageData = questions[currIndex];
            this.append("QUESTION", nextPageData);
        }
    }

    shallowCloneData(): void {
        if (!this.head || !this.tail) {
            return;
        }

        // assume you have already cloned the necessary data in the current Page
        let currPage: Page = this.head;

        while (currPage.prev) {
            // QuestionPage is always the last in the stack so we only worry
            // about ListPage objects
            const prevPage: ListPage = currPage.prev as ListPage;
            const prevIndex: number = prevPage.lastIndex;

            if ((prevPage.data as Section).questions) {
                (prevPage.data as Section).questions[prevIndex] =
                    currPage.data as Question;
            } else if ((prevPage.data as Quiz).sections) {
                (prevPage.data as Quiz).sections[prevIndex] =
                    currPage.data as Section;
            } else {
                (prevPage.data as Quiz[])[prevIndex] = currPage.data as Quiz;
            }

            currPage = currPage.prev;
        }
    }

    shallowClone(): PageStack {
        if (!this.head || !this.tail) {
            return new PageStack();
        }

        const pageStackCopy = new PageStack();
        let curr: Page | null = this.tail;

        while (curr) {
            pageStackCopy.append(curr.pageType, curr.data);
            pageStackCopy.head!.lastIndex = curr.lastIndex;
            curr = curr.next;
        }

        return pageStackCopy;
    }
}
