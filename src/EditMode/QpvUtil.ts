import { Question, FlexibleQuestion, MC, McChoice } from "../types.js";
import { Nav, NavNode } from "./QpvNav.js";
import { PageStack } from "../shared/utils/PageStack.js";
import { QpvState } from "./useQpv.js";

export type QpvNodeId =
    | "qa"
    | "qi"
    | "mc"
    | "question"
    | "answer"
    | "cancel"
    | "add"
    | "A"
    | "B"
    | "C"
    | "D";

export class QpvUtil {
    // Creating a separate FlexibleQuestion type allows to persist MC choices data
    // even when cycling question type options in the GUI
    static toFlexibleQuestion(question: Question): FlexibleQuestion {
        let choices: string[] = [];

        if (question.type === "mc") {
            choices = [...question.choices];
        }

        return {
            type: question.type,
            q: question.q,
            a: question.a,
            choices: choices,
        };
    }

    static toQuestion(flexibleQuestion: FlexibleQuestion): Question {
        if (flexibleQuestion.type === "mc") {
            return QpvUtil.cloneFlexibleQuestion(flexibleQuestion) as Question;
        }

        return {
            type: flexibleQuestion.type,
            q: flexibleQuestion.q,
            a: flexibleQuestion.a,
        };
    }

    static cloneFlexibleQuestion(
        flexibleQuestion: FlexibleQuestion,
    ): FlexibleQuestion {
        return {
            ...flexibleQuestion,
            choices: flexibleQuestion.choices.slice(),
        };
    }

    static getFlexibleData(pageStack: PageStack): FlexibleQuestion {
        const data: Question = pageStack.top().data as Question;
        return QpvUtil.toFlexibleQuestion(data);
    }

    static copyState(state: QpvState): QpvState {
        const stateCopy: QpvState = {
            ...state,
            data: Object.assign({}, state.data),
        };
        stateCopy.data.choices = stateCopy.data.choices.slice();
        return stateCopy;
    }

    static isWithinMc(currNode: QpvNodeId): boolean {
        return (
            currNode === "A" ||
            currNode === "B" ||
            currNode === "C" ||
            currNode === "D"
        );
    }

    static getMcIndex(currNode: QpvNodeId): number {
        return ["A", "B", "C", "D"].indexOf(currNode);
    }

    static getMcText(currNode: QpvNodeId, state: QpvState): string {
        if (!QpvUtil.isWithinMc(currNode))
            throw new Error("Invalid function call");

        return state.data.choices[QpvUtil.getMcIndex(currNode)];
    }

    static isWithinEqt(state: QpvState): boolean {
        return (
            state.currNode === "qa" ||
            state.currNode === "qi" ||
            state.currNode === "mc"
        );
    }

    static getNavInit(flexibleQuestion: FlexibleQuestion) {
        return (nav: Nav<QpvNodeId>): void => {
            // qa, qi, mc are options to modify the Question type
            const qa: NavNode<QpvNodeId> = nav.addNode("qa");
            const qi = nav.addNode("qi");
            const mc = nav.addNode("mc");
            const question = nav.addNode("question");
            const answer = nav.addNode("answer");
            const cancel = nav.addNode("cancel");

            // qa
            qa.setDown(qi);

            // qi
            qi.setDown(mc);
            qi.setUp(qa);

            // mc
            mc.setUp(qi);
            mc.setDown(question);

            // q
            question.setUp(mc);
            question.setRight(answer);
            question.setDown(cancel);

            // a
            answer.setUp(mc);
            answer.setDown(cancel);
            answer.setLeft(question);

            // cancel
            cancel.setUp(question);

            flexibleQuestion.type === "mc" &&
                QpvUtil.addMcNodes(nav, flexibleQuestion as MC);

            // initialize Nav to start by pointing at the question node
            nav.goTo("question");
        };
    }

    static addMcNodes(nav: Nav<QpvNodeId>, question: MC): void {
        let prev: ["answer", "question"] | McChoice[] = ["answer", "question"];
        for (let i = 0; i < question.choices.length; ++i) {
            const name: McChoice = String.fromCharCode(65 + i) as McChoice;
            nav.insertNode(name, prev);
            prev = [name];
        }

        if (question.choices.length < 4) {
            nav.insertNode("add", prev);
        }
    }
}
