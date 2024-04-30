import { Question } from "../../interfaces.js";
import { Nav, Opt, PageStack, Update } from "./classes.js";

export interface QuestionData {
    type: "qa" | "qi" | "mc";
    q: string;
    a: string;
    choices: { [key: string]: string }[];
}

export type opts =
    | "qa"
    | "qi"
    | "mc"
    | "question"
    | "answer"
    | "save"
    | "cancel"
    | "add"
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"; // should update to only allow A - D

export class QuestionUtils {
    static getNavInitializer(questionData: Question) {
        return (nav: Nav<opts>): Opt<opts> => {
            const qa = nav.addNode("qa");
            const qi = nav.addNode("qi");
            const mc = nav.addNode("mc");
            const question = nav.addNode("question");
            const answer = nav.addNode("answer");
            const save = nav.addNode("save");
            const cancel = nav.addNode("cancel");

            // qa
            qa.linkDown(qi);

            // qi
            qi.linkDown(mc);
            qi.linkUp(qa);

            // mc
            mc.linkUp(qi);
            mc.linkDown(question);

            // q
            question.linkUp(mc);
            question.linkRight(answer);
            question.linkDown(save);

            // a
            answer.linkUp(mc);
            answer.linkDown(save);
            answer.linkLeft(question);

            // save
            save.linkUp(question);
            save.linkRight(cancel);

            // cancel
            cancel.linkUp(answer);
            cancel.linkLeft(save);

            // need to add check if mcList has any items
            if (questionData.type === "mc") {
                const add: Opt<opts> = nav.addNode("add");

                const opts: Opt<opts>[] = [];
                for (let i = 0; i < questionData.choices.length; ++i) {
                    const name = String.fromCharCode(65 + i) as opts;
                    const opt = nav.addNode(name);
                    opts.push(opt);
                }

                for (let i = 0; i < opts.length; ++i) {
                    if (i === 0) {
                        question.linkDown(opts[i]);
                        answer.linkDown(opts[i]);
                        opts[i].linkUp(question);
                    }

                    if (opts[i + 1]) {
                        opts[i].linkDown(opts[i + 1]);
                    }

                    if (opts[i - 1]) {
                        opts[i].linkUp(opts[i - 1]);
                    }

                    if (i === opts.length - 1) {
                        opts[i].linkDown(add);
                    }
                }

                if (opts.length) {
                    add.linkUp(opts[opts.length - 1]);
                } else {
                    add.linkUp(question);
                    question.linkDown(add);
                    answer.linkDown(add);
                }

                add.linkDown(save);
                save.linkUp(add);
                save.linkRight(cancel);
                cancel.linkUp(add);
                cancel.linkLeft(save);
            }

            // return an Opt node which will be assigned to the curr pointer
            return question;
        };
    }

    static toQuestionData(question: Question): QuestionData {
        let choices: { [key: string]: string }[];

        if (question.type === "mc") {
            choices = [...question.choices];
        } else {
            choices = [];
        }

        return {
            type: question.type,
            q: question.q,
            a: question.a,
            choices: choices,
        };
    }

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

    static cloneQuestion(question: QuestionData): QuestionData {
        return {
            type: question.type,
            q: question.q,
            a: question.a,
            choices: question.choices,
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
