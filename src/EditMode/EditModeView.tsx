import React, { useState, useContext, createContext } from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { QuestionTypes, Quiz } from "../types.js";
import { Window } from "../shared/hooks/useWindow.js";
import { Page, PageStack } from "../shared/utils/PageStack.js";
import { InputBox } from "../shared/components/InputBox.js";
import { FocusableBox } from "../shared/components/Focusable.js";
import { TitleBox } from "../shared/components/TitleBox.js";
import { ShowMode } from "../shared/components/ShowMode.js";
import { QpvNode } from "./utils/QpvUtils.js";
import { useLpv } from "./hooks/useLpv.js";
import { Icon } from "../shared/components/Icons.js";
import { QpvState, useQpv } from "./hooks/useQpv.js";

interface PageContext {
    pageStack: PageStack;
    setPageStack: (ps: PageStack) => void;
}

export const PageContext = createContext<PageContext | null>(null);

interface EditPagesProps {
    quizzes: Quiz[];
}

export function EditModeView({ quizzes }: EditPagesProps): React.ReactNode {
    const [pageStack, setPageStack] = useState<PageStack>(
        new PageStack(quizzes),
    );

    const page: Page = pageStack.top();

    const currentPage: React.ReactNode =
        page.pageType === "QUESTION" ? <QuestionPageView /> : <ListPageView />;

    return (
        <PageContext.Provider
            value={{
                pageStack: pageStack,
                setPageStack: setPageStack,
            }}
        >
            {currentPage}
        </PageContext.Provider>
    );
}

function ListPageView(): React.ReactNode {
    const { page, edit, setEdit, window, currIndex, normal, message } =
        useLpv();

    function mapItems(items: any[]): React.ReactNode[] {
        const components: React.ReactNode[] = [];
        const isFocus = (i: number): boolean => i === currIndex;
        const acceptsInput = (i: number): boolean => !normal && isFocus(i);

        for (let i = 0; i < items.length; ++i) {
            components.push(
                <FocusableBox isFocus={isFocus(i)} key={i}>
                    <Box>
                        <Icon type="EDIT" />
                        <InputBox
                            acceptsInput={acceptsInput(i)}
                            value={edit}
                            onChange={setEdit}
                            defaultText={page.getItemDesc(i)}
                        ></InputBox>
                    </Box>
                </FocusableBox>,
            );
        }

        // add items box
        const i = items.length;
        components.push(
            <FocusableBox isFocus={isFocus(i)} key={i}>
                <Icon type="ADD" />
                <InputBox
                    acceptsInput={acceptsInput(i)}
                    value={edit}
                    onChange={setEdit}
                    defaultText={page.addItemText}
                ></InputBox>
            </FocusableBox>,
        );

        return components;
    }

    return (
        <>
            <TitleBox title={page.title}>
                <Text color="red">{message}</Text>
                <ShowMode normal={normal} />
            </TitleBox>
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

type SetInput = (s: string) => void;
interface QpvContext {
    state: QpvState;
    setQuestionInput: SetInput;
    setAnswerInput: SetInput;
    setMcInput: SetInput;
    setAddInput: SetInput;
    getMcText: (q: QpvNode) => string;
    getMcIndex: (q: QpvNode) => number;
}

export const QpvContext = createContext<QpvContext | null>(null);

function QuestionPageView(): React.ReactNode {
    const {
        state,
        setQuestionInput,
        setAnswerInput,
        setMcInput,
        setAddInput,
        getMcText,
        getMcIndex,
    } = useQpv();

    return (
        <>
            <QpvContext.Provider
                value={{
                    state,
                    setQuestionInput,
                    setAnswerInput,
                    setMcInput,
                    setAddInput,
                    getMcText,
                    getMcIndex,
                }}
            >
                <TitleBox title={"Edit Question"}>
                    <ShowMode normal={state.normal} />
                </TitleBox>
                <Box flexDirection="column" justifyContent="center">
                    <EditQuestionType />
                    <QuestionContents />
                </Box>
                <Box width="100%" justifyContent="flex-end" marginTop={1}>
                    <Box
                        borderStyle={
                            state.currNode === "cancel" ? "bold" : "round"
                        }
                        borderColor={state.currNode === "cancel" ? "blue" : ""}
                    >
                        <Text>Cancel</Text>
                    </Box>
                </Box>
            </QpvContext.Provider>
        </>
    );
}

function EditQuestionType(): React.ReactNode {
    const { state } = useContext(QpvContext)!;

    const isWithin: boolean =
        state.currNode === "qa" ||
        state.currNode === "qi" ||
        state.currNode === "mc";

    return (
        <FocusableBox
            flexDirection="column"
            width="100%"
            isFocus={isWithin}
            alignItems="flex-start"
        >
            <EqtItem itemType={"qa"} textContent={"Question Answer"} />
            <EqtItem itemType={"qi"} textContent={"Question Input"} />
            <EqtItem itemType={"mc"} textContent={"Multiple Choice"} />
        </FocusableBox>
    );
}

interface EqtItemProps {
    itemType: QuestionTypes;
    textContent: string;
}

function EqtItem({ itemType, textContent }: EqtItemProps): React.ReactNode {
    const { state } = useContext(QpvContext)!;

    function isChosen(): boolean {
        return itemType === state.data.type;
    }

    function getColor(): string {
        if (state.currNode === itemType) return "blue";
        return "";
    }

    function checkBox(): string {
        return isChosen() ? "[ x ] " : "[   ] ";
    }

    return (
        <Box alignItems="center">
            <Text color={isChosen() ? "green" : ""}>{checkBox()}</Text>
            <Text color={getColor()}>{textContent}</Text>
        </Box>
    );
}

function QuestionContents(): React.ReactNode {
    const { state } = useContext(QpvContext)!;
    if (state.data.type === "mc") {
        return (
            <>
                <QandABoxes />
                <MCBoxes />
            </>
        );
    }

    return <QandABoxes />;
}

function QandABoxes(): React.ReactNode {
    const { state, setQuestionInput, setAnswerInput } = useContext(QpvContext)!;

    function acceptsInput(targetNode: QpvNode): boolean {
        return state.currNode === targetNode && !state.normal;
    }

    // highlight border with red if not a valid multiple choice answer
    function answerIsValid(): boolean {
        if (state.data.type !== "mc") return true;

        const possibleValues: string[] = [];
        for (let i = 0; i < state.data.choices.length; ++i) {
            possibleValues.push(String.fromCharCode(65 + i));
        }

        return (
            possibleValues.includes(state.answerInput.toUpperCase()) ||
            possibleValues.includes(state.data.a.toUpperCase())
        );
    }

    const questionBox: React.ReactNode = (
        <FocusableBox
            width="50%"
            flexDirection="column"
            alignItems="center"
            isFocus={state.currNode === "question"}
        >
            <Box>
                <Text dimColor>Question: </Text>
            </Box>
            <HorizontalLine />
            <InputBox
                acceptsInput={acceptsInput("question")}
                value={state.questionInput}
                onChange={setQuestionInput}
                defaultText={state.data.q}
            />
        </FocusableBox>
    );

    const answerBoxChildren: React.ReactNode = (
        <>
            <Box>
                <Text dimColor>Answer: </Text>
            </Box>
            <HorizontalLine />
            <InputBox
                acceptsInput={acceptsInput("answer")}
                value={state.answerInput}
                onChange={setAnswerInput}
                defaultText={state.data.a}
            />
        </>
    );

    let answerBox: React.ReactNode;
    if (answerIsValid()) {
        answerBox = (
            <FocusableBox
                width="45%"
                alignItems="center"
                flexDirection="column"
                isFocus={state.currNode === "answer"}
            >
                {answerBoxChildren}
            </FocusableBox>
        );
    } else {
        answerBox = (
            <FocusableBox
                width="45%"
                flexDirection="column"
                alignItems="center"
                borderColor="red"
                defaultBorderColor="red"
                isFocus={state.currNode === "answer"}
            >
                {answerBoxChildren}
            </FocusableBox>
        );
    }

    return (
        <Box width="100%" justifyContent="space-around" gap={-1}>
            {questionBox}
            {answerBox}
        </Box>
    );
}

function MCBoxes(): React.ReactNode {
    const { state } = useContext(QpvContext)!;

    function mapChoices(): React.ReactNode[] {
        const built: React.ReactNode[] = [];
        const getLabel = (index: number) => String.fromCharCode(65 + index);

        for (let i = 0; i < state.data.choices.length; ++i) {
            const label: string = getLabel(i);
            built.push(
                <Box width="100%" alignItems="center" key={i}>
                    <Box>
                        <Text bold>{`${label}: `}</Text>
                    </Box>
                    <FocusableBox isFocus={state.currNode === label}>
                        <McText index={i} />
                    </FocusableBox>
                </Box>,
            );
        }

        return built;
    }

    return (
        <>
            {mapChoices()}
            {state.data.choices.length < 4 ? <AddChoice /> : <></>}
        </>
    );
}

function McText({ index }: { index: number }): React.ReactNode {
    const { state, getMcIndex, setMcInput } = useContext(QpvContext)!;

    const acceptsInput: boolean =
        !state.normal && getMcIndex(state.currNode) === index;
    const defaultText: string = state.data.choices[index];

    return (
        <InputBox
            acceptsInput={acceptsInput}
            value={state.mcInput}
            onChange={setMcInput}
            defaultText={defaultText}
        />
    );
}

function AddChoice(): React.ReactNode {
    const { state, setAddInput } = useContext(QpvContext)!;
    const acceptsInput: boolean = !state.normal && state.currNode === "add";

    return (
        <Box width="100%">
            <Text>{"   "}</Text>
            <FocusableBox isFocus={state.currNode === "add"}>
                <Icon type="ADD" />
                <InputBox
                    acceptsInput={acceptsInput}
                    value={state.addInput}
                    onChange={setAddInput}
                    defaultText="Add Choice"
                    defaultTextColor="green"
                />
            </FocusableBox>
        </Box>
    );
}
