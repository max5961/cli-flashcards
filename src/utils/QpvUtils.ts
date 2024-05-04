import { Question, FlexibleQuestion } from "../types.js";
import { Nav, Opt } from "./Nav.js";
import { PageStack, QuestionPage } from "./PageStack.js";

export type QpvNode =
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

export class QpvUtils {
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

    // Only including one type would force you to create a dummy choices array
    // if you chose to edit the raw JSON, so we need to convert back to the
    // regular Question type
    static toQuestion(flexibleQuestion: FlexibleQuestion): Question {
        if (flexibleQuestion.type === "mc") {
            return QpvUtils.cloneFlexibleQuestion(flexibleQuestion) as Question;
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
        return QpvUtils.toFlexibleQuestion(data);
    }

    static getNavInit(flexibleQuestion: FlexibleQuestion) {
        return (nav: Nav<QpvNode>): void => {
            // qa, qi, mc are options to modify the Question type
            const qa = nav.addNode("qa");
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

            QpvUtils.linkMultipleChoiceNodes(nav, flexibleQuestion);

            // initialize Nav to start by pointing at the question node
            nav.goTo("question");
        };
    }

    static linkMultipleChoiceNodes(
        nav: Nav<QpvNode>,
        questionData: Question,
    ): void {
        if (questionData.type !== "mc") {
            return;
        }

        // add is only present in MC type
        const add: Opt<QpvNode> = nav.addNode("add");

        // Create Opt Nodes and push to an array then use array to set pointers
        const choices: Opt<QpvNode>[] = [];
        for (let i = 0; i < questionData.choices.length; ++i) {
            const name = String.fromCharCode(65 + i) as QpvNode;
            const choice: Opt<QpvNode> = nav.addNode(name);
            choices.push(choice);
        }

        for (let i = 0; i < choices.length; ++i) {
            if (i === 0) {
                nav.getNode("question").setDown(choices[i]);
                nav.getNode("answer").setDown(choices[i]);
                choices[i].setUp(nav.getNode("question"));
            }

            if (choices[i + 1]) {
                choices[i].setDown(choices[i + 1]);
            }

            if (choices[i - 1]) {
                choices[i].setUp(choices[i - 1]);
            }

            if (i === choices.length - 1) {
                choices[i].setDown(add);
            }
        }

        // 4 is the maximum number of MC choices (unlink add Node)
        if (choices.length >= 4) {
            const lastChoice = choices[choices.length - 1];
            const cancel = nav.getNode("cancel");
            lastChoice.setDown(cancel);
            cancel.setUp(lastChoice);

            // else set adds up pointer to last choice
        } else if (choices.length) {
            const cancel = nav.getNode("cancel");
            const lastChoice = choices[choices.length - 1];
            add.setUp(lastChoice);
            add.setDown(cancel);
            cancel.setUp(add);

            // there are not any choices
        } else {
            const cancel = nav.getNode("cancel");
            cancel.setUp(add);
            add.setDown(cancel);
            add.setUp(nav.getNode("question"));
            nav.getNode("question").setDown(add);
            nav.getNode("answer").setDown(add);
        }
    }
}
