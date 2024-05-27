import { useContext, useEffect, useRef, useState } from "react";
import { PageContext } from "./EditModeView.js";
import { FlexibleQuestion, Question, QuestionTypes } from "../types.js";
import { QpvNodeId, QpvUtil } from "./QpvUtil.js";
import { Nav, useNav } from "./QpvNav.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { Write } from "../shared/utils/Write.js";
import { PageStack, SectionPage } from "../shared/utils/PageStack.js";

interface Dep {
    state: QpvState;
    setState: (s: QpvState) => void;
    pageStack: PageStack;
    setPageStack: (s: PageStack) => void;
    nav: Nav<QpvNodeId>;
    initialData: React.RefObject<FlexibleQuestion>;
    setErrMsg: (s: string) => void;
    applyChanges: (stateCopy: QpvState) => void;
}

export interface QpvState {
    data: FlexibleQuestion;
    currNode: QpvNodeId;
    normal: boolean;
    questionInput: string;
    answerInput: string;
    mcInput: string;
    addInput: string;
}

export function useQpv() {
    const { pageStack, setPageStack } = useContext(PageContext)!;

    // used for reverting changes
    const initialData = useRef<FlexibleQuestion>(
        QpvUtil.getFlexibleData(pageStack),
    );

    const [state, setState] = useState<QpvState>({
        data: initialData.current,
        currNode: "question",
        normal: true,
        questionInput: "",
        answerInput: "",
        mcInput: "",
        addInput: "",
    });

    const [errMsg, setErrMsg] = useState<string>("");

    const { nav } = useNav<QpvNodeId, FlexibleQuestion>(
        state.data,
        QpvUtil.getNavInit,
    );

    useEffect(() => {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.currNode = nav.getCurrNode();
        setState(stateCopy);
    }, []);

    useEffect(() => {
        nav.goTo(state.currNode);
    }, [nav]);

    // set functions used in useInput hook
    function setQuestionInput(s: string): void {
        setState({
            ...state,
            questionInput: s,
        });
    }

    function setAnswerInput(s: string): void {
        setState({
            ...state,
            answerInput: s,
        });
    }

    function setMcInput(s: string): void {
        setState({
            ...state,
            mcInput: s,
        });
    }

    function setAddInput(s: string): void {
        setState({
            ...state,
            addInput: s,
        });
    }

    // update state and write changes to file
    function applyChanges(stateCopy: QpvState): void {
        const newQuestion: Question = QpvUtil.toQuestion(stateCopy.data);
        const pageStackCopy: PageStack = pageStack.getShallowClone();
        pageStackCopy.top().data = newQuestion;
        pageStackCopy.propagateChanges();

        setPageStack(pageStackCopy);
        setState(stateCopy);
        Write.writeData(pageStackCopy);
    }

    const dependencies: Dep = {
        state,
        setState,
        applyChanges,
        pageStack,
        setPageStack,
        nav,
        initialData,
        setErrMsg,
    };

    function handleKeyBinds(command: Command | null): void {
        if (errMsg.length) {
            setErrMsg("");
        }

        if (!command) return;
        handleNavKeyBinds(dependencies, command);
        handleCancelKeyBinds(dependencies, command);
        handleEqtKeyBinds(dependencies, command);
        handleQAKeyBinds(dependencies, command);
        handleMcKeyBinds(dependencies, command);
        handleAddKeyBinds(dependencies, command);
    }

    useKeyBinds(handleKeyBinds, state.normal);

    return {
        state,
        errMsg,
        setQuestionInput,
        setAnswerInput,
        setMcInput,
        setAddInput,
        applyChanges,
    };
}
// navigation keybinds
function handleNavKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack, nav } = dep;
    const stateCopy: QpvState = QpvUtil.copyState(state);

    if (command === "UP") {
        nav.moveUp();

        const nextNode = nav.getCurrNode();
        stateCopy.currNode = nextNode;

        if (QpvUtil.isWithinMc(nextNode)) {
            stateCopy.mcInput = QpvUtil.getMcText(nextNode, state);
        }

        setState(stateCopy);
        return;
    }

    if (command === "DOWN") {
        nav.moveDown();

        const nextNode = nav.getCurrNode();
        stateCopy.currNode = nextNode;

        if (QpvUtil.isWithinMc(nextNode)) {
            stateCopy.mcInput = QpvUtil.getMcText(nextNode, state);
        }

        setState(stateCopy);
    }

    if (command === "RIGHT") {
        nav.moveRight();
        stateCopy.currNode = nav.getCurrNode();
        setState(stateCopy);
    }

    if (command === "LEFT") {
        nav.moveLeft();
        stateCopy.currNode = nav.getCurrNode();
        setState(stateCopy);
    }

    if (command === "PREV_PAGE") {
        const pageStackCopy: PageStack = pageStack.getShallowClone();
        pageStackCopy.pop();
        setPageStack(pageStackCopy);
    }
}

// cancel button
function handleCancelKeyBinds(dep: Dep, command: Command | null): void {
    const { state, applyChanges, initialData } = dep;

    if (state.currNode !== "cancel" || command !== "RETURN_KEY") {
        return;
    }

    const stateCopy: QpvState = QpvUtil.copyState(state);
    stateCopy.data = initialData.current!;
    stateCopy.answerInput = stateCopy.data.a;
    applyChanges(stateCopy);
}

// multiple choice keybinds
function handleMcKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, applyChanges, nav } = dep;

    // if currNode is not choice
    if (!QpvUtil.isWithinMc(state.currNode)) return;

    if (command === "DELETE_ITEM") {
        const toSliceIndex: number = QpvUtil.getMcIndex(state.currNode);
        const isLastItem: boolean =
            toSliceIndex === state.data.choices.length - 1;

        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.data.choices.splice(toSliceIndex, 1);
        if (stateCopy.data.choices.length === 0) {
            nav.goTo("add");
            stateCopy.currNode = nav.getCurrNode();
        } else if (isLastItem) {
            nav.moveUp();
            stateCopy.currNode = nav.getCurrNode();
        }

        applyChanges(stateCopy);
    }

    if (command === "CLEAR_TEXT") {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.mcInput = "";
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "ENTER_INSERT") {
        const stateCopy: QpvState = QpvUtil.copyState(state);

        const mcIndex: number = QpvUtil.getMcIndex(state.currNode);
        const currText: string = stateCopy.data.choices[mcIndex];

        stateCopy.normal = false;
        stateCopy.mcInput = currText;

        setState(stateCopy);
    }

    if (command === "EXIT_INSERT") {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        const index: number = QpvUtil.getMcIndex(state.currNode);
        stateCopy.data.choices[index] = state.mcInput;
        stateCopy.normal = true;
        applyChanges(stateCopy);
    }
}

// edit question type keybinds
function handleEqtKeyBinds(dep: Dep, command: Command | null): void {
    const { state, applyChanges } = dep;

    if (!QpvUtil.isWithinEqt(state) || command !== "RETURN_KEY") {
        return;
    }

    const stateCopy: QpvState = QpvUtil.copyState(state);
    stateCopy.data.type = state.currNode as QuestionTypes;
    applyChanges(stateCopy);
}

// question / answer box keybinds
function handleQAKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, applyChanges, pageStack, setErrMsg, initialData } =
        dep;

    function isDuplicate(): boolean {
        const questions: SectionPage = pageStack.top().prev as SectionPage;
        const questionNames = questions.listItems
            .map((q) => q.q)
            .filter((q) => q !== initialData.current!.q && q !== state.data.q);
        return questionNames.includes(state.questionInput);
    }

    function handleDuplicate(): void {
        setState({
            ...state,
            data: { ...state.data, q: "" },
            normal: true,
        });
        setErrMsg("Question name already exists");
    }

    if (state.currNode !== "question" && state.currNode !== "answer") {
        return;
    }

    if (command === "CLEAR_TEXT") {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.answerInput = "";
        stateCopy.questionInput = "";
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "ENTER_INSERT" || command === "RETURN_KEY") {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.questionInput = stateCopy.data.q;
        stateCopy.answerInput = stateCopy.data.a;
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "EXIT_INSERT") {
        if (isDuplicate()) {
            handleDuplicate();
            return;
        }

        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.normal = true;

        if (state.currNode === "question") {
            stateCopy.data.q = state.questionInput;
        } else {
            stateCopy.data.a = state.answerInput;
        }

        applyChanges(stateCopy);
    }
}

// add choice keybinds
function handleAddKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, applyChanges } = dep;

    if (state.currNode !== "add") {
        return;
    }

    if (
        command === "CLEAR_TEXT" ||
        command === "ENTER_INSERT" ||
        command === "RETURN_KEY"
    ) {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.addInput = "";
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "EXIT_INSERT") {
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.normal = true;

        // do nothing besides exit insert if no input
        if (stateCopy.addInput === "") {
            setState(stateCopy);
            return;
        }

        stateCopy.data.choices.push(state.addInput);
        stateCopy.addInput = "";

        if (stateCopy.data.choices.length >= 4) {
            // nav will reset to state.currNode on any state.data change
            stateCopy.currNode = "D";
        }

        applyChanges(stateCopy);
    }
}
