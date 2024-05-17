import { Quiz, Section, Question, QA, QI, MC } from "../../types.js";
type Data = Quiz[] | Quiz | Section | Question;
type ListItems = Quiz[] | Section[] | Question[];
export type PageType = "QUIZZES" | "QUIZ" | "SECTION" | "QUESTION";

export abstract class Page {
    public abstract pageType: PageType;
    public abstract data: Data;
    public prev: Page | null;
    public next: Page | null;
    public lastIndex: number;

    constructor() {
        this.prev = null;
        this.next = null;
        this.lastIndex = 0;
    }

    abstract cloneData(): Question | Section | Quiz | Quiz[];
}

export class QuestionPage<T extends Question> extends Page {
    public pageType: "QUESTION";
    public data: T;

    constructor(data: T) {
        super();
        this.pageType = "QUESTION";
        this.data = data;
    }

    cloneData(): Question {
        const questionData: Question = this.data as Question;

        let copy: QA | QI | MC;
        if (questionData.type === "mc") {
            copy = {
                ...questionData,
                choices: questionData.choices.slice(),
            };
        } else {
            copy = {
                ...questionData,
            };
        }

        return copy;
    }

    setQuestion(question: string): void {
        this.data.q = question;
    }

    setAnswer(answer: string): void {
        this.data.a = answer;
    }
}

export class MCPage extends QuestionPage<MC> {
    constructor(data: MC) {
        super(data);
    }

    removeMC(index: number): void {
        (this.data as MC).choices.splice(index, 1);
    }

    addMC(choice: string): void {
        const data: MC = this.data as MC;
        if (data.choices.length >= 4) {
            throw new Error("Maximum multiple choice length is 4");
        }

        data.choices.push(choice);
    }

    editMC(index: number, newChoice: string): void {
        (this.data as MC).choices[index] = newChoice;
    }
}

// QUIZZES | QUIZ | SECTION
export abstract class ListPage extends Page {
    public abstract listItems: ListItems;
    public title!: string;
    public addItemText!: string;
    public getItemDesc!: (index: number) => string;

    constructor() {
        super();
    }

    // called when appending to PageStack
    abstract buildPage(): void;
    abstract removeListItem(index: number): void;
    abstract addListItem(name: string): void;
    abstract setListItemName(index: number, name: string): void;
    abstract nameExists(name: string): boolean;
}

export class QuizzesPage extends ListPage {
    public pageType: "QUIZZES";
    public data: Quiz[];
    public listItems!: Quiz[];

    constructor(data: Quiz[]) {
        super();
        this.pageType = "QUIZZES";
        this.data = data;
    }

    buildPage(): void {
        if (this.pageType !== "QUIZZES") {
            throw new Error("Invalid PageType for QuizzesPage");
        }

        this.title = "All Quizzes";
        this.addItemText = "Add Quiz";
        this.listItems = this.data as Quiz[];
        this.getItemDesc = (index: number) => {
            const quiz: Quiz = (this.data as Quiz[])[index];
            return quiz.fileName;
        };
    }

    cloneData(): Quiz[] {
        this.listItems = this.listItems.slice();
        return this.listItems;
    }

    removeListItem(index: number): void {
        this.listItems.splice(index, 1);
        this.data = this.listItems;
        this.lastIndex = index;
    }

    addListItem(name: string): void {
        this.listItems.push({
            fileName: name,
            sections: [],
        });
        this.data = this.listItems;
        this.lastIndex = this.listItems.length - 1;
    }

    setListItemName(index: number, name: string): void {
        this.listItems[index].fileName = name;
        this.data = this.listItems;
        this.lastIndex = index;
    }

    nameExists(name: string): boolean {
        const fileNames: string[] = this.listItems.map((quiz) => quiz.fileName);
        return fileNames.includes(name);
    }
}

export class QuizPage extends ListPage {
    public pageType: "QUIZ";
    public data: Quiz;
    public listItems!: Section[];

    constructor(data: Quiz) {
        super();
        this.pageType = "QUIZ";
        this.data = data;
    }

    buildPage(): void {
        if (this.pageType !== "QUIZ") {
            throw new Error("Invalid PageType for QuizPage");
        }

        if (!this.prev) {
            throw new Error("QuizPage should have a previous Page");
        }

        const prev: ListPage = this.prev as ListPage;
        const fileName: string = prev.getItemDesc(prev.lastIndex);

        this.title = `Sections in: ${fileName}`;
        this.addItemText = "Add Section";
        this.listItems = (this.data as Quiz).sections;
        this.getItemDesc = (index: number) => {
            return (this.listItems as Section[])[index].name;
        };
    }

    cloneData(): Quiz {
        this.listItems = this.listItems.slice();
        return {
            fileName: this.data.fileName,
            sections: this.listItems,
        };
    }

    removeListItem(index: number): void {
        this.listItems.splice(index, 1);
        this.data.sections = this.listItems;
        this.lastIndex = index;
    }

    addListItem(name: string): void {
        this.listItems.push({
            name: name,
            questions: [],
        });
        this.data.sections = this.listItems;
        this.lastIndex = this.listItems.length - 1;
    }

    setListItemName(index: number, name: string): void {
        this.listItems[index].name = name;
        this.data.sections = this.listItems;
        this.lastIndex = index;
    }

    nameExists(name: string): boolean {
        const sectionNames: string[] = this.listItems.map(
            (section) => section.name,
        );
        return sectionNames.includes(name);
    }
}

export class SectionPage extends ListPage {
    public pageType: "SECTION";
    public data: Section;
    public listItems!: Question[];

    constructor(data: Section) {
        super();
        this.pageType = "SECTION";
        this.data = data;
    }

    buildPage(): void {
        if (this.pageType !== "SECTION") {
            throw new Error("Invalid PageType for SectionPage");
        }

        if (!this.prev || !this.prev.prev) {
            throw new Error("SectionPage should have two previous Pages");
        }

        const sections: ListPage = this.prev as QuizPage;
        const quizzes: ListPage = this.prev.prev as QuizzesPage;

        const sectionName = sections.getItemDesc(sections.lastIndex);
        const fileName = quizzes.getItemDesc(quizzes.lastIndex);

        this.title = `Questions in: ${fileName} -> ${sectionName}`;
        this.addItemText = "Add Question";
        this.listItems = (this.data as Section).questions;
        this.getItemDesc = (index: number) => {
            return (this.listItems as Question[])[index].q;
        };
    }

    cloneData(): Section {
        this.listItems = this.listItems.slice();
        return {
            name: this.data.name,
            questions: this.listItems,
        };
    }

    removeListItem(index: number): void {
        this.listItems.splice(index, 1);
        this.data.questions = this.listItems;
        this.lastIndex = index;
    }

    addListItem(name: string): void {
        this.listItems.push({
            type: "qa",
            q: name,
            a: "",
        });
        this.data.questions = this.listItems;
        this.lastIndex = this.listItems.length - 1;
    }

    setListItemName(index: number, name: string): void {
        this.listItems[index].q = name;
        this.data.questions = this.listItems;
        this.lastIndex = index;
    }

    nameExists(name: string): boolean {
        const questionNames: string[] = this.listItems.map(
            (question) => question.q,
        );
        return questionNames.includes(name);
    }
}

const emptyStackMessage: string = "PageStack should never be empty";
export class PageStack {
    private head!: Page | null;
    private tail!: Page | null;
    private size: number;

    constructor(data: Data) {
        this.size = 0;
        this.append("QUIZZES", data);
    }

    getSize(): number {
        return this.size;
    }

    top(): Page {
        if (!this.head) {
            throw new Error(emptyStackMessage);
        }
        return this.head;
    }

    bottom(): Page {
        if (!this.tail) {
            throw new Error(emptyStackMessage);
        }
        return this.tail;
    }

    pop(): void {
        // always want to have at least one Page in the stack
        if (!this.head || this.size <= 1) {
            throw new Error(emptyStackMessage);
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
        if (pageType === "QUIZZES") {
            newPage = new QuizzesPage(data as Quiz[]);
        } else if (pageType === "QUIZ") {
            newPage = new QuizPage(data as Quiz);
        } else if (pageType === "SECTION") {
            newPage = new SectionPage(data as Section);
        } else if (pageType === "QUESTION") {
            const q: Question = data as Question;
            if (q.type === "mc") {
                newPage = new MCPage(q);
            } else if (q.type === "qa") {
                newPage = new QuestionPage<QA>(q);
            } else if (q.type === "qi") {
                newPage = new QuestionPage<QI>(q);
            } else {
                throw new Error("Invalid question type");
            }
        } else {
            throw new Error("Invalid PageType argument");
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
            throw new Error("PageStack should never be empty");
        }

        if (this.head.pageType === "QUESTION") {
            throw new Error("Cannot append more Pages to a QuestionPage");
        }

        const top: ListPage = this.head as ListPage;
        top.lastIndex = currIndex;

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

    // shallowCloneData(): void {
    propagateChanges(): void {
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
                const section: Section = prevPage.data as Section;
                section.questions[prevIndex] = currPage.cloneData() as Question;
            } else if ((prevPage.data as Quiz).sections) {
                const quiz: Quiz = prevPage.data as Quiz;
                quiz.sections[prevIndex] = currPage.cloneData() as Section;
            } else {
                const quizzes: Quiz[] = prevPage.data as Quiz[];
                quizzes[prevIndex] = currPage.cloneData() as Quiz;
            }

            currPage = currPage.prev;
        }
    }

    getShallowClone(): PageStack {
        if (!this.head || !this.tail) {
            throw new Error("PageStack should never be empty");
        }

        this.propagateChanges();

        const initialData: Quiz[] = (this.tail as QuizzesPage).data;
        const pageStackCopy = new PageStack(initialData);
        pageStackCopy.tail!.lastIndex = this.tail.lastIndex;

        let curr: Page | null = this.tail.next;
        while (curr) {
            pageStackCopy.append(curr.pageType, curr.data);
            pageStackCopy.head!.lastIndex = curr.lastIndex;
            curr = curr.next;
        }

        return pageStackCopy;
    }
}
