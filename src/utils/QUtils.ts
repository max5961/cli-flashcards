import { Question, QuestionData } from "../types.js";
import { Nav, Opt } from "./Nav.js";
import { PageStack } from "./PageStack.js";
import Update from "./Write.js";

export type QBoxNode =
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

export class QUtils {
    // returns a function to be passed as a callback to the constructor of a
    // Nav object

    // why is this a Question object and not QuestionData?
    static getNavInitializer(questionData: Question) {
        return (nav: Nav<QBoxNode>): void => {
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

            QUtils.handleMcNav(nav, questionData);

            // initialize Nav to start by pointing at the question node
            nav.goTo("question");
        };
    }

    static handleMcNav(nav: Nav<QBoxNode>, questionData: Question): void {
        if (questionData.type !== "mc") {
            return;
        }

        // add is only present in MC type
        const add: Opt<QBoxNode> = nav.addNode("add");

        // Create Opt Nodes and push to an array then use array to set pointers
        const choices: Opt<QBoxNode>[] = [];
        for (let i = 0; i < questionData.choices.length; ++i) {
            const name = String.fromCharCode(65 + i) as QBoxNode;
            const choice: Opt<QBoxNode> = nav.addNode(name);
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
            add.setUp(choices[choices.length - 1]);

            // there are not any choices move
        } else {
            const cancel = nav.getNode("cancel");
            cancel.setUp(add);
            add.setDown(cancel);
            add.setUp(nav.getNode("question"));
            nav.getNode("question").setDown(add);
            nav.getNode("answer").setDown(add);
        }
    }

    // Creating a separate QuestionData type allows to persist MC choices data
    // through cycling question type options in the GUI
    static toQuestionData(question: Question): QuestionData {
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

    // ...still need two separate types, because it would make no sense if you
    // chose to edit the raw JSON and were forced to add an arbitrary choices
    // option regardless of the type of the Question
    static toQuestion(questionData: QuestionData): Question {
        if (questionData.type === "mc") {
            return {
                type: questionData.type,
                q: questionData.q,
                a: questionData.a,
                choices: questionData.choices,
            };
        }

        return {
            type: questionData.type,
            q: questionData.q,
            a: questionData.a,
        };
    }

    static cloneQuestionData(questionData: QuestionData): QuestionData {
        const choicesClone: string[] = questionData.choices.slice();

        return {
            type: questionData.type,
            q: questionData.q,
            a: questionData.a,
            choices: choicesClone,
        };
    }

    static writeData(
        pageStack: PageStack,
        setPageStack: (ps: PageStack) => void,
    ) {
        const update = new Update(pageStack, setPageStack);
        return (questionData: QuestionData) => {
            update.handleUpdateQuestion(questionData);
        };
    }
}
