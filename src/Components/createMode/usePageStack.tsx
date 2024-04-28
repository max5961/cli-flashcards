import React from "react";
import { QuizData, QuizFileData, Section, Question } from "../../interfaces.js";

type Page = QuizData | QuizFileData | Section | Question;
type PageStack = { page: Page; lastIndex: number }[];
type ListItems = QuizFileData[] | Section[] | Question[];
interface PageContextProps {
    // for building list
    listItems: ListItems | null;
    title: string | null;
    addItemText: string | null;
    getDesc: ((index: number) => string) | null;

    // for traversing pages
    pageStack: PageStack | null;
    setPageStack: ((ps: PageStack) => void) | null;
    getNextPages: ((n: number) => Page)[];
}

function usePageStack(quizData: QuizData) {
    //
}
