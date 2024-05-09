import React, { useContext, useState } from "react";
import { Question, Quiz, Section } from "../types.js";
import { ListPage, PageStack, QuizzesPage } from "../shared/utils/PageStack.js";
import { Window, useWindow } from "../shared/hooks/useWindow.js";
import { FocusableBox } from "../shared/components/FocusableBox.js";
import { Box, Text } from "ink";
import { TitleBox } from "../shared/components/TitleBox.js";
import { HorizontalLine } from "../shared/components/Lines.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { AppContext } from "../App.js";
import { Icon } from "../shared/components/Icons.js";

interface CqvProps {
    quizzes: Quiz[];
}

export function ChooseQuestionsView({ quizzes }: CqvProps): React.ReactNode {
    const [pageStack, setPageStack] = useState<PageStack>(
        new PageStack(quizzes),
    );
    const { window, currIndex, setCurrIndex } = useWindow(5);
    const { setMode, setQuestions } = useContext(AppContext)!;

    const page: ListPage = pageStack.top() as ListPage;

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

    function mapItems(items: any[]): React.ReactNode[] {
        const built: React.ReactNode[] = [];

        built.push(
            <FocusableBox isFocus={currIndex === 0} key={0}>
                <Box>
                    <Icon type="MERGE" />
                    <Text>{getMergeAllText()}</Text>
                </Box>
            </FocusableBox>,
        );

        // i + 1 because the first listItem is the All Box
        const isFocus = (i: number): boolean => i + 1 === currIndex;
        for (let i = 0; i < items.length; ++i) {
            built.push(
                <FocusableBox isFocus={isFocus(i)} key={i + 1}>
                    <Box>
                        <Icon type="QUIZ" />
                        <Text>{page.getItemDesc(i)}</Text>
                    </Box>
                </FocusableBox>,
            );
        }

        return built;
    }

    function handleKeyBinds(command: Command | null): void {
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

        if (command === "GO_TO_TOP") {
            setCurrIndex(0);
        }

        if (command === "GO_TO_BOTTOM") {
            setCurrIndex(page.listItems.length);
        }

        if (command === "RETURN_KEY") {
            if (currIndex === 0) {
                // load quiz will ALL quizzes
                if (page.pageType === "QUIZZES") {
                    const questions: Question[] = [];
                    for (const quizFile of quizzes) {
                        for (const section of quizFile.sections) {
                            for (const question of section.questions) {
                                questions.push(question);
                            }
                        }
                    }

                    setQuestions(questions);
                    setMode("QUIZ");
                    return;
                }

                // load quiz with all sections in a quiz
                if (page.pageType === "QUIZ") {
                    // need to get a quiz with all sections in a given quiz
                    const questions: Question[] = [];
                    const sections: Section[] = page.listItems as Section[];
                    for (const section of sections) {
                        for (const question of section.questions) {
                            questions.push(question);
                        }
                    }

                    setQuestions(questions);
                    setMode("QUIZ");
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
                const questions: Question[] = [];
                const section: Section = page.listItems[
                    currIndex - 1
                ] as Section;

                for (const question of section.questions) {
                    questions.push(question);
                }
                setQuestions(questions);
                setMode("QUIZ");
            }
        }
    }

    useKeyBinds(handleKeyBinds);

    return (
        <>
            <TitleBox title={page.title}></TitleBox>
            <HorizontalLine />
            <Window
                items={mapItems(page.listItems!)}
                window={window}
                currIndex={currIndex}
                scrollColor="#009293"
                scrollBorder="round"
                scrollMiddle={false}
                scrollPosition="right"
                flexDirection="column"
            />
        </>
    );
}
