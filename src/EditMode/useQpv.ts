import { useContext, useEffect, useRef, useState } from "react";
import { PageContext } from "./EditModeView.js";
import { FlexibleQuestion, Question, QuestionTypes } from "../types.js";
import { QpvNode, QpvUtil } from "./QpvUtil.js";
import { Nav } from "../shared/utils/Nav.js";
import { useNav } from "../shared/hooks/useNav.js";
import { useKeyBinds } from "../shared/hooks/useKeyBinds.js";
import { Command } from "../shared/utils/KeyBinds.js";
import { Write } from "../shared/utils/Write.js";
import { PageStack } from "../shared/utils/PageStack.js";

interface Dep {
    state: QpvState;
    setState: (s: QpvState) => void;
    pageStack: PageStack;
    setPageStack: (s: PageStack) => void;
    nav: Nav<QpvNode>;
    initialData: React.RefObject<FlexibleQuestion>;
}

export interface QpvState {
    data: FlexibleQuestion;
    currNode: QpvNode;
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

    const { nav } = useNav<QpvNode, FlexibleQuestion>(
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

    const dependencies: Dep = {
        state,
        setState,
        pageStack,
        setPageStack,
        nav,
        initialData,
    };

    function handleKeyBinds(command: Command | null): void {
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
        setQuestionInput,
        setAnswerInput,
        setMcInput,
        setAddInput,
    };
}
// navigation keybinds
function handleNavKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack, nav, initialData } = dep;
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

    if (command === "DELETE_KEY") {
        const pageStackCopy: PageStack = pageStack.getShallowClone();
        pageStackCopy.pop();
        setPageStack(pageStackCopy);
    }
}

// cancel button
function handleCancelKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack, initialData } = dep;

    if (state.currNode !== "cancel" || command !== "RETURN_KEY") {
        return;
    }

    const stateCopy: QpvState = QpvUtil.copyState(state);
    stateCopy.data = initialData.current!;
    stateCopy.answerInput = stateCopy.data.a;

    const pageStackCopy: PageStack = pageStack.getShallowClone();
    const questionCopy = QpvUtil.toQuestion(initialData.current!);
    pageStackCopy.top().data = questionCopy;
    pageStackCopy.propagateChanges();

    setPageStack(pageStackCopy);
    setState(stateCopy);
    Write.writeData(pageStackCopy);
}

// multiple choice keybinds
function handleMcKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack, nav } = dep;

    // if currNode is not choice
    if (!QpvUtil.isWithinMc(state.currNode)) return;

    if (command === "DELETE") {
        // handle mc delete
        const toSliceIndex: number = QpvUtil.getMcIndex(state.currNode);
        const isLastItem: boolean =
            toSliceIndex === state.data.choices.length - 1;

        const pageStackCopy = pageStack.getShallowClone();
        const dataCopy = QpvUtil.cloneFlexibleQuestion(state.data);
        dataCopy.choices.splice(toSliceIndex, 1);
        pageStackCopy.top().data = dataCopy;
        pageStackCopy.propagateChanges();

        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.data = dataCopy;

        if (dataCopy.choices.length === 0) {
            nav.goTo("add");
            stateCopy.currNode = nav.getCurrNode();
        } else if (isLastItem) {
            nav.moveUp();
            stateCopy.currNode = nav.getCurrNode();
        }

        setPageStack(pageStackCopy);
        setState(stateCopy);

        Write.writeData(pageStackCopy);
    }

    if (command === "CLEAR") {
        // handle mc clear
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.mcInput = "";
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "ENTER_INSERT") {
        // handle mc enter insert
        const stateCopy: QpvState = QpvUtil.copyState(state);

        const mcIndex: number = QpvUtil.getMcIndex(state.currNode);
        const currText: string = stateCopy.data.choices[mcIndex];

        stateCopy.normal = false;
        stateCopy.mcInput = currText;

        setState(stateCopy);
    }

    if (command === "EXIT_INSERT") {
        // handle mc exit insert
        const stateCopy: QpvState = QpvUtil.copyState(state);
        const dataCopy: FlexibleQuestion = QpvUtil.cloneFlexibleQuestion(
            stateCopy.data,
        );
        const index: number = QpvUtil.getMcIndex(state.currNode);
        dataCopy.choices[index] = state.mcInput;

        stateCopy.data = dataCopy;
        stateCopy.normal = true;

        const pageStackCopy: PageStack = pageStack.getShallowClone();
        pageStackCopy.top().data = QpvUtil.toQuestion(dataCopy);
        pageStackCopy.getShallowClone();

        setPageStack(pageStackCopy);
        setState(stateCopy);

        Write.writeData(pageStackCopy);
    }
}

// edit question type keybinds
function handleEqtKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack } = dep;

    if (!QpvUtil.isWithinEqt(state) || command !== "RETURN_KEY") {
        return;
    }

    const stateCopy: QpvState = QpvUtil.copyState(state);
    const questionCopy: FlexibleQuestion = QpvUtil.cloneFlexibleQuestion(
        stateCopy.data,
    );
    questionCopy.type = state.currNode as QuestionTypes;
    stateCopy.data = questionCopy;

    const pageStackCopy = pageStack.getShallowClone();
    pageStackCopy.top().data = QpvUtil.toQuestion(questionCopy);
    pageStackCopy.propagateChanges();
    Write.writeData(pageStackCopy);

    setPageStack(pageStackCopy);
    setState(stateCopy);
}

// question / answer box keybinds
function handleQAKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack } = dep;

    if (state.currNode !== "question" && state.currNode !== "answer") {
        return;
    }

    if (command === "CLEAR") {
        // handle qa clear
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.answerInput = "";
        stateCopy.questionInput = "";
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "ENTER_INSERT" || command === "RETURN_KEY") {
        // handle qa enter insert
        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.questionInput = stateCopy.data.q;
        stateCopy.answerInput = stateCopy.data.a;
        stateCopy.normal = false;
        setState(stateCopy);
    }

    if (command === "EXIT_INSERT") {
        // handle qa exit insert
        const pagesCopy: PageStack = pageStack.getShallowClone();

        const stateCopy: QpvState = QpvUtil.copyState(state);
        stateCopy.normal = true;

        if (state.currNode === "question") {
            stateCopy.data.q = state.questionInput;
        } else {
            stateCopy.data.a = state.answerInput;
        }

        const question: Question = QpvUtil.toQuestion(stateCopy.data);
        pagesCopy.top().data = question;
        pagesCopy.propagateChanges();
        Write.writeData(pagesCopy);

        setPageStack(pagesCopy);
        setState(stateCopy);
    }
}

// add choice keybinds
function handleAddKeyBinds(dep: Dep, command: Command | null): void {
    const { state, setState, pageStack, setPageStack } = dep;

    if (state.currNode !== "add") {
        return;
    }

    if (
        command === "CLEAR" ||
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

        // do nothing if no input
        if (stateCopy.addInput === "") {
            stateCopy.normal = true;
            setState(stateCopy);
            return;
        }

        const pageStackCopy: PageStack = pageStack.getShallowClone();
        const dataCopy: FlexibleQuestion = QpvUtil.cloneFlexibleQuestion(
            stateCopy.data,
        );

        dataCopy.choices.push(state.addInput);
        stateCopy.data = dataCopy;
        stateCopy.normal = true;
        stateCopy.addInput = "";

        pageStackCopy.top().data = QpvUtil.toQuestion(dataCopy);
        pageStackCopy.propagateChanges();

        if (dataCopy.choices.length >= 4) {
            // nav will reset to state.currNode on any data change
            stateCopy.currNode = "D";
        }

        setPageStack(pageStackCopy);
        setState(stateCopy);

        Write.writeData(pageStackCopy);
    }
}
