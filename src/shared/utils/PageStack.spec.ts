import { Quiz } from "../../types.js";
import { MCPage, PageStack, QuizPage, SectionPage } from "./PageStack.js";

const inputData: Quiz[] = [
    {
        fileName: "file1",
        sections: [
            {
                name: "section1",
                questions: [
                    {
                        type: "qa",
                        q: "Question 1",
                        a: "Answer 1",
                    },
                    {
                        type: "qi",
                        q: "Question 2",
                        a: "Answer 2",
                    },
                    {
                        type: "mc",
                        q: "Question 3",
                        a: "Answer 3",
                        choices: ["choice0", "choice1", "choice2", "choice3"],
                    },
                ],
            },
        ],
    },
];

// SectionPage is top of the stack
function getStack() {
    const inputDataCopy = JSON.parse(JSON.stringify(inputData));
    const pageStack: PageStack = new PageStack(inputDataCopy);
    pageStack.appendNextPage(0); // append first Question
    pageStack.appendNextPage(0); // append first Section
    return pageStack;
}

enum Mod {
    modifiedFileName = "MODIFIED FILE NAME",
    modifiedSectionName = "MODIFIED SECTION NAME",
    modifiedQuestion = "MODIFIED QUESTION",
    modifiedChoice = "MODIFIED CHOICE",
}

const modifiedData: Quiz[] = [
    {
        fileName: Mod.modifiedFileName,
        sections: [
            {
                name: Mod.modifiedSectionName,
                questions: [
                    {
                        type: "qa",
                        q: Mod.modifiedQuestion,
                        a: "Answer 1",
                    },
                    {
                        type: "mc",
                        q: "Question 3",
                        a: "Answer 3",
                        choices: ["choice0", Mod.modifiedChoice, "choice3"], // splice index 2, modify index 1
                    },
                ],
            },
        ],
    },
];

describe("Shallow clone data with PageStack", () => {
    function modifyData(): PageStack {
        const ps: PageStack = getStack();
        // append the MC question
        ps.top().lastIndex = 2;
        ps.appendNextPage(2);

        // Edit MC Question through QuestionPage
        const c1: PageStack = ps.getShallowClone();
        const questionPage = c1.top() as MCPage;
        questionPage.removeMC(2);
        questionPage.editMC(1, Mod.modifiedChoice);

        // Edit question name and remove question through SectionPage
        const c2: PageStack = c1.getShallowClone();
        c2.pop();
        const sectionPage = c2.top() as SectionPage;
        sectionPage.setListItemName(0, Mod.modifiedQuestion);
        sectionPage.removeListItem(1);

        // Edit section name through QuizPage
        const c3: PageStack = c2.getShallowClone();
        c3.pop();
        const quizPage = c3.top() as QuizPage;
        quizPage.setListItemName(0, Mod.modifiedSectionName);

        // Edit quiz name through QuizzesPage
        const c4: PageStack = c3.getShallowClone();
        c4.pop();
        const quizzesPage: QuizPage = c4.top() as QuizPage;
        quizzesPage.setListItemName(0, Mod.modifiedFileName);

        const finalCopy = c4.getShallowClone();
        return finalCopy;
    }

    test("Modify and remove then pop() Pages", () => {
        const finalCopy = modifyData();
        const finalData: Quiz[] = finalCopy.bottom().data as Quiz[];
        expect(finalData).toEqual(modifiedData);
    });

    test("Can stringify", () => {
        const finalCopy = modifyData();
        const finalData: Quiz[] = finalCopy.bottom().data as Quiz[];
        try {
            JSON.stringify(finalData, null, 4);
            expect(true).toBe(true);
        } catch (err) {
            expect(true).toBe(false);
        }
    });
});
