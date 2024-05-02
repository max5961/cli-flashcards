import os from "os";
import path from "path";
import fs from "fs/promises";
import { PageStack, Page } from "./PageStack.js";
import { Quiz, Section, Question, QuestionData } from "../types.js";

type SetPageStack = (ps: PageStack) => void;

export class Write {
    private directory: string;

    constructor() {
        this.directory = this.getDirectory();
    }

    getDirectory() {
        return path.join(os.homedir(), ".local", "share", "flashcards");
    }

    async clearDirectory(): Promise<void> {
        const files: string[] = await fs.readdir(this.directory);
        for (const file of files) {
            const filePath = path.join(this.directory, file);
            fs.unlink(filePath);
        }
    }

    async writeData(quizzes: Quiz[]): Promise<void> {
        await this.clearDirectory();

        for (const quiz of quizzes) {
            const json: string = JSON.stringify(quiz, null, 4);
            const fileName: string = quiz.fileName;
            const filePath: string = path.join(this.directory, fileName);

            await fs.writeFile(filePath, json, "utf-8");
        }
    }
}

export default class Update {
    private pageStack: PageStack;
    private setPageStack: SetPageStack;
    private page: Page;

    constructor(pageStack: PageStack, setPageStack: SetPageStack) {
        this.pageStack = pageStack;
        this.setPageStack = setPageStack;
        this.page = pageStack.top()!;
    }

    getDirectory(): string {
        return path.join(os.homedir(), ".local", "share", "flashcards");
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
            const quizzes = pageStackCopy.top()!.listItems as Quiz[];

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
            const quizzes = this.page.listItems! as Quiz[];
            quizzes.push({
                fileName: newName,
                sections: [],
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
