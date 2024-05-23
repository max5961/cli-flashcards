import { useContext, useEffect, useState } from "react";
import { AppContext, WhichMode } from "../App.js";
import { ListPage, PageStack, QuizzesPage } from "../shared/utils/PageStack.js";
import { Question, Quiz, Section } from "../types.js";
import { useWindow } from "../shared/hooks/useWindow.js";
import { Command } from "../shared/utils/KeyBinds.js";
import Read from "../shared/utils/Read.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";

export interface InvalidState {
    errorMessage: string;
    invalidQuestion: string;
}

export function useSelectionMode(quizzes: Quiz[]) {
    const [pageStack, setPageStack] = useState<PageStack>(
        new PageStack(quizzes),
    );
    const { window, currIndex, setCurrIndex } = useWindow(5);
    const { setMode, setQuestions, setPreStack, normal } =
        useContext(AppContext)!;

    const [invalid, setInvalid] = useState<InvalidState>({
        errorMessage: "",
        invalidQuestion: "",
    });

    const page: ListPage = pageStack.top() as ListPage;

    useEffect(() => {
        // off by one because of the 'merge all' option being at top
        setCurrIndex(page.lastIndex);
    }, [pageStack]);

    // Checks for invalid questions and then enters QuizMode if all are valid.
    // Otherwise, display an error message in the gui
    function handleSelection(questions: Question[]): void {
        if (questions.length === 0) {
            setInvalid({
                errorMessage: "There are no questions in this selection",
                invalidQuestion: "",
            });
            return;
        }

        for (const question of questions) {
            if (question.type !== "mc") continue;

            const validLabels: string[] = [];
            for (let i = 0; i < question.choices.length; ++i) {
                validLabels.push(String.fromCharCode(65 + i));
            }

            if (!validLabels.includes(question.a.toUpperCase())) {
                setInvalid({
                    errorMessage: `Multiple Choice question: '${question.q}' has either an invalid answer or no choices. (y to fix)`,
                    invalidQuestion: question.q,
                });
                return;
            }
        }

        setQuestions(questions);
        setMode("QUIZ");
    }

    // If there is a question which has an invalid format, this searches for the
    // question and builds the page. Not a good search solution, but its simple
    // and it works
    async function handleFixQuestion(
        toFix: string,
        setPreStack: (s: PageStack) => void,
        setMode: (m: WhichMode) => void,
    ): Promise<void> {
        const data: Quiz[] = await Read.getData();
        const pageStack: PageStack = new PageStack(data);

        for (let i = 0; i < data.length; ++i) {
            const quiz: Quiz = data[i];
            for (let j = 0; j < quiz.sections.length; ++j) {
                const section: Section = quiz.sections[j];
                for (let k = 0; k < section.questions.length; ++k) {
                    const question: Question = section.questions[k];
                    if (question.q === toFix) {
                        pageStack.appendNextPage(i);
                        pageStack.appendNextPage(j);
                        pageStack.appendNextPage(k);
                    }
                }
            }
        }

        setPreStack(pageStack);
        setMode("FIX");
    }

    function handleKeyBinds(command: Command | null): void {
        if (command !== "RETURN_KEY") {
            setInvalid({
                errorMessage: "",
                invalidQuestion: "",
            });
        }

        if (command === "DELETE_KEY") {
            if (page.pageType === "QUIZZES") {
                setMode("START");
            } else {
                const pageStackCopy: PageStack = pageStack.getShallowClone();
                pageStackCopy.pop();
                setPageStack(pageStackCopy);
            }
        }
        if (command === "DOWN") {
            currIndex < page.listItems.length && setCurrIndex(currIndex + 1);
        }

        if (command === "UP") {
            currIndex > 0 && setCurrIndex(currIndex - 1);
        }

        if (command === "GO_TO_TOP_OF_LIST") {
            setCurrIndex(0);
        }

        if (command === "GO_TO_BOTTOM_OF_LIST") {
            setCurrIndex(page.listItems.length);
        }

        if (command === "RETURN_KEY") {
            if (currIndex === 0) {
                // load quiz will ALL quizzes
                if (page.pageType === "QUIZZES") {
                    const questions: Question[] = quizzes.flatMap(
                        (quizFile) => {
                            return quizFile.sections.flatMap((section) =>
                                section.questions.flatMap(
                                    (question) => question,
                                ),
                            );
                        },
                    );

                    handleSelection(questions);
                    return;
                }

                // load quiz with all sections in a quiz
                if (page.pageType === "QUIZ") {
                    // need to get a quiz with all sections in a given quiz
                    // const questions: Question[] = [];
                    const sections: Section[] = page.listItems as Section[];
                    const questions: Question[] = sections.flatMap(
                        (section) => {
                            return section.questions.flatMap(
                                (question) => question,
                            );
                        },
                    );
                    handleSelection(questions);
                    return;
                }

                return;
            }

            if (page.pageType === "QUIZZES") {
                // load next Quiz section
                const pageStackCopy: PageStack = pageStack.getShallowClone();
                pageStackCopy.appendNextPage(currIndex - 1);
                setPageStack(pageStackCopy);
                return;
            }

            if (page.pageType === "QUIZ") {
                // need to get a quiz with the given section in the given quiz
                const section: Section = page.listItems[
                    currIndex - 1
                ] as Section;

                const questions: Question[] = section.questions.map(
                    (question) => question,
                );

                handleSelection(questions);
                return;
            }
        }

        if (command === "MARK_YES" && invalid.errorMessage.length) {
            handleFixQuestion(invalid.invalidQuestion, setPreStack, setMode);
        }
    }

    useKeyBinds(handleKeyBinds, normal);

    function getMergeAllText(): string {
        if (page.pageType === "QUIZZES") {
            return `Merge all quizzes into a single quiz`;
        }

        if (page.pageType === "QUIZ") {
            const prevPage: QuizzesPage = page.prev as QuizzesPage;
            const quizTitle: string = prevPage.getItemDesc(prevPage.lastIndex);
            return `Merge all sections from '${quizTitle}' into a single quiz`;
        }

        throw new Error("Unhandled Page type");
    }

    return { getMergeAllText, window, currIndex, page, invalid };
}
