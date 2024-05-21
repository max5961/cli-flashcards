import { useContext, useEffect, useRef, useState } from "react";
import { PageContext } from "../EditModeView.js";
import { FlexibleQuestion, Question, QuestionTypes } from "../../types.js";
import { QpvNode, QpvUtils } from "../utils/QpvUtils.js";
import { useNav } from "../../shared/hooks/useNav.js";
import { useKeyBinds } from "../../shared/hooks/useKeyBinds.js";
import { Command } from "../../shared/utils/KeyBinds.js";
import { Write } from "../../shared/utils/Write.js";
import { PageStack } from "../../shared/utils/PageStack.js";

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
        QpvUtils.getFlexibleData(pageStack),
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
        QpvUtils.getNavInit,
    );

    useEffect(() => {
        const stateCopy: QpvState = Object.assign({}, state);
        stateCopy.currNode = nav.getCurrNode();
        setState(stateCopy);
    }, []);

    useEffect(() => {
        nav.goTo(state.currNode);
    }, [nav]);

    function copyState(): QpvState {
        const stateCopy: QpvState = {
            ...state,
            data: Object.assign({}, state.data),
        };
        stateCopy.data.choices = stateCopy.data.choices.slice();
        return stateCopy;
    }

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

    function setData(d: FlexibleQuestion): void {
        const copy: QpvState = copyState();
        copy.data = d;
        setState(copy);
    }

    // helper functions
    function isWithinMc(currNode: QpvNode): boolean {
        return (
            currNode === "A" ||
            currNode === "B" ||
            currNode === "C" ||
            currNode === "D"
        );
    }

    function getMcIndex(currNode: QpvNode): number {
        return ["A", "B", "C", "D"].indexOf(currNode);
    }

    function getMcText(currNode: QpvNode): string {
        if (!isWithinMc(currNode)) throw new Error("Invalid function call");

        return state.data.choices[getMcIndex(currNode)];
    }

    function isWithinEqt(): boolean {
        return (
            state.currNode === "qa" ||
            state.currNode === "qi" ||
            state.currNode === "mc"
        );
    }

    // navigation keybinds
    function handleNavKeyBinds(command: Command | null): void {
        const stateCopy: QpvState = Object.assign({}, state);

        if (command === "UP") {
            nav.moveUp();

            const nextNode = nav.getCurrNode();
            stateCopy.currNode = nextNode;

            if (isWithinMc(nextNode)) {
                stateCopy.mcInput = getMcText(nextNode);
            }

            setState(stateCopy);
            return;
        }

        if (command === "DOWN") {
            nav.moveDown();

            const nextNode = nav.getCurrNode();
            stateCopy.currNode = nextNode;

            if (isWithinMc(nextNode)) {
                stateCopy.mcInput = getMcText(nextNode);
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

        if (state.currNode === "cancel" && command === "RETURN_KEY") {
            const pageStackCopy = pageStack.getShallowClone();
            const questionCopy = QpvUtils.toQuestion(initialData.current);
            pageStackCopy.top().data = questionCopy;
            pageStackCopy.propagateChanges();

            setPageStack(pageStackCopy);
            setData(initialData.current);
            Write.writeData(pageStackCopy);
        }
    }

    // cancel button
    function handleCancelKeyBinds(command: Command | null): void {
        if (state.currNode !== "cancel" || command !== "RETURN_KEY") {
            return;
        }

        const stateCopy: QpvState = Object.assign({}, state);
        stateCopy.data = initialData.current;

        const pageStackCopy: PageStack = pageStack.getShallowClone();
        const questionCopy = QpvUtils.toQuestion(initialData.current);
        pageStackCopy.top().data = questionCopy;
        pageStackCopy.propagateChanges();

        setPageStack(pageStackCopy);
        setState(stateCopy);
        Write.writeData(pageStackCopy);
    }

    // edit question type keybinds
    function handleEqtKeyBinds(command: Command | null): void {
        if (!isWithinEqt() || command !== "RETURN_KEY") {
            return;
        }

        const stateCopy: QpvState = Object.assign({}, state);
        const questionCopy: FlexibleQuestion = QpvUtils.cloneFlexibleQuestion(
            stateCopy.data,
        );
        questionCopy.type = state.currNode as QuestionTypes;
        stateCopy.data = questionCopy;

        const pageStackCopy = pageStack.getShallowClone();
        pageStackCopy.top().data = QpvUtils.toQuestion(questionCopy);
        pageStackCopy.propagateChanges();
        Write.writeData(pageStackCopy);

        setPageStack(pageStackCopy);
        setState(stateCopy);
    }

    function handleQAKeyBinds(command: Command | null): void {
        if (state.currNode !== "question" && state.currNode !== "answer") {
            return;
        }

        if (command === "CLEAR") {
            // handle qa clear
            const stateCopy: QpvState = Object.assign({}, state);
            stateCopy.answerInput = "";
            stateCopy.questionInput = "";
            stateCopy.normal = false;
            setState(stateCopy);
        }

        if (command === "ENTER_INSERT" || command === "RETURN_KEY") {
            // handle qa enter insert
            const stateCopy: QpvState = Object.assign({}, state);
            stateCopy.questionInput = stateCopy.data.q;
            stateCopy.answerInput = stateCopy.data.a;
            stateCopy.normal = false;
            setState(stateCopy);
        }

        if (command === "EXIT_INSERT") {
            // handle qa exit insert
            const pagesCopy: PageStack = pageStack.getShallowClone();

            const stateCopy: QpvState = Object.assign({}, state);
            stateCopy.normal = true;

            if (state.currNode === "question") {
                stateCopy.data.q = state.questionInput;
            } else {
                stateCopy.data.a = state.answerInput;
            }

            const question: Question = QpvUtils.toQuestion(stateCopy.data);
            pagesCopy.top().data = question;
            pagesCopy.propagateChanges();
            Write.writeData(pagesCopy);

            setPageStack(pagesCopy);
            setState(stateCopy);
        }
    }

    // multiple choice keybinds
    function handleMcKeyBinds(command: Command | null): void {
        // if currNode is not choice
        if (!isWithinMc(state.currNode)) return;

        if (command === "DELETE") {
            // handle mc delete
            const toSliceIndex: number = getMcIndex(state.currNode);
            const isLastItem: boolean =
                toSliceIndex === state.data.choices.length - 1;

            const pageStackCopy = pageStack.getShallowClone();
            const dataCopy = QpvUtils.cloneFlexibleQuestion(state.data);
            dataCopy.choices.splice(toSliceIndex, 1);
            pageStackCopy.top().data = dataCopy;
            pageStackCopy.propagateChanges();

            const stateCopy: QpvState = Object.assign({}, state);
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
            const stateCopy: QpvState = Object.assign({}, state);
            stateCopy.mcInput = "";
            stateCopy.normal = false;
            setState(stateCopy);
        }

        if (command === "ENTER_INSERT") {
            // handle mc enter insert
            const stateCopy: QpvState = Object.assign({}, state);

            const mcIndex: number = getMcIndex(state.currNode);
            const currText: string = stateCopy.data.choices[mcIndex];

            stateCopy.normal = false;
            stateCopy.mcInput = currText;

            setState(stateCopy);
        }

        if (command === "EXIT_INSERT") {
            // handle mc exit insert
            const stateCopy: QpvState = Object.assign({}, state);
            const dataCopy: FlexibleQuestion = QpvUtils.cloneFlexibleQuestion(
                stateCopy.data,
            );
            const index: number = getMcIndex(state.currNode);
            dataCopy.choices[index] = state.mcInput;

            stateCopy.data = dataCopy;
            stateCopy.normal = true;

            const pageStackCopy: PageStack = pageStack.getShallowClone();
            pageStackCopy.top().data = QpvUtils.toQuestion(dataCopy);
            pageStackCopy.getShallowClone();

            setPageStack(pageStackCopy);
            setState(stateCopy);

            Write.writeData(pageStackCopy);
        }
    }

    // add choice keybinds
    function handleAddKeyBinds(command: Command | null): void {
        if (state.currNode !== "add") {
            return;
        }

        if (
            command === "CLEAR" ||
            command === "ENTER_INSERT" ||
            command === "RETURN_KEY"
        ) {
            const copy: QpvState = Object.assign({}, state);
            copy.addInput = "";
            copy.normal = false;
            setState(copy);
        }

        if (command === "EXIT_INSERT") {
            // handle add exit insert
            const stateCopy: QpvState = Object.assign({}, state);
            const pageStackCopy: PageStack = pageStack.getShallowClone();
            const dataCopy: FlexibleQuestion = QpvUtils.cloneFlexibleQuestion(
                stateCopy.data,
            );

            dataCopy.choices.push(state.addInput);
            stateCopy.data = dataCopy;
            stateCopy.normal = true;
            stateCopy.addInput = "";

            pageStackCopy.top().data = QpvUtils.toQuestion(dataCopy);
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

    function handleKeyBinds(command: Command | null): void {
        if (!command) return;
        handleNavKeyBinds(command);
        handleCancelKeyBinds(command);
        handleEqtKeyBinds(command);
        handleQAKeyBinds(command);
        handleMcKeyBinds(command);
        handleAddKeyBinds(command);
    }

    useKeyBinds(handleKeyBinds, state.normal);

    return {
        state,
        setQuestionInput,
        setAnswerInput,
        setMcInput,
        setAddInput,
        getMcIndex,
        getMcText,
    };
}
