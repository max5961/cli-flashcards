import { Question } from "../types.js";

export type Eval = "YES" | "NO" | undefined;

export class QuizState {
    // An array of ordered or shuffled pointers to Question objects in the
    // questions array. This way the questions array is never mutated and we can
    // easily link state to Question objects through the eval map
    public indexes: number[];

    // Current progress through indexes array
    public position: number;

    // The key is this.indexes[this.position] and correlates to the given Question
    // object.  Eval is the self evaluation given
    public evalMap: { [key: number]: Eval };

    // is the current Question showing the answer?
    public showingAnswer: boolean;

    // For Multiple Choice
    public highlightChoice: boolean;
    public mcIndex: number;

    constructor(
        questions: Readonly<Question[]>,
        {
            indexes = questions.map((_: Question, i: number) => i),
            position = 0,
            evalMap = {},
            showingAnswer = false,
            highlightChoice = false,
            currIndex = 0,
        },
    ) {
        this.indexes = indexes;
        this.position = position;
        this.evalMap = evalMap;
        this.showingAnswer = showingAnswer;
        this.highlightChoice = highlightChoice;
        this.mcIndex = currIndex;
    }

    copy(): QuizState {
        const copy: QuizState = Object.assign({}, this);
        Object.setPrototypeOf(copy, this);
        copy.indexes = this.indexes.slice();
        copy.evalMap = Object.assign({}, this.evalMap);
        return copy;
    }

    getQuestion(questions: Readonly<Question[]>): Question {
        return questions[this.indexes[this.position]];
    }

    getEvalKey(): number {
        return this.indexes[this.position];
    }

    getEval(): Eval {
        const key = this.getEvalKey();
        return this.evalMap[key];
    }

    getScore(): { [key: string]: number } {
        let yes: number = 0;
        let no: number = 0;
        let noEval: number = 0;

        for (let i = 0; i < this.indexes.length; ++i) {
            if (!this.evalMap[i]) {
                ++noEval;
                continue;
            }

            if (this.evalMap[i] === "YES") {
                ++yes;
            } else {
                ++no;
            }
        }

        return {
            yes,
            no,
            noEval,
        };
    }

    cleanUp(): void {
        this.mcIndex = 0;
        this.showingAnswer = false;
        this.highlightChoice = false;
    }

    // shuffles a portion of the indexes array
    shuffleIndexes(s: number, cycles: number = 0): void {
        if (cycles >= 25) return;
        const originalStart = s;

        const getRandom = (s: number, e: number) => {
            return s + Math.floor(Math.random() * (e - s));
        };

        const nums: number[] = this.indexes;
        while (s < nums.length) {
            const randomIndex: number = getRandom(s, nums.length);
            const tmpEnd: number = nums[nums.length - 1];
            nums[nums.length - 1] = nums[randomIndex];
            nums[randomIndex] = tmpEnd;
            ++s;
        }

        this.shuffleIndexes(originalStart, ++cycles);
    }

    randomize(): QuizState {
        const copy: QuizState = this.copy();
        copy.shuffleIndexes(copy.position + 1);
        return copy;
    }

    prevQuestion(): QuizState {
        const copy: QuizState = this.copy();

        if (copy.position > 0) {
            --copy.position;
            copy.cleanUp();
        }

        return copy;
    }

    nextQuestion(): QuizState {
        const copy: QuizState = this.copy();

        if (copy.position < copy.indexes.length - 1) {
            ++copy.position;
            copy.cleanUp();
        }

        return copy;
    }

    moveFocusUp(questions: Readonly<Question[]>): QuizState {
        const copy: QuizState = this.copy();
        copy.showingAnswer = false;
        copy.highlightChoice = false;

        const question: Question = copy.getQuestion(questions);

        if (question.type === "mc" && copy.mcIndex > 0) {
            --copy.mcIndex;
        }

        return copy;
    }

    moveFocusDown(questions: Readonly<Question[]>): QuizState {
        const copy: QuizState = this.copy();
        copy.showingAnswer = false;
        copy.highlightChoice = false;

        const question: Question = copy.getQuestion(questions);

        if (
            question.type === "mc" &&
            copy.mcIndex < question.choices.length - 1
        ) {
            ++copy.mcIndex;
        }

        return copy;
    }

    markYes(): QuizState {
        const copy: QuizState = this.copy();
        copy.evalMap[this.getEvalKey()] = "YES";
        return copy;
    }

    markNo(): QuizState {
        const copy: QuizState = this.copy();
        copy.evalMap[this.getEvalKey()] = "NO";
        return copy;
    }

    isMarked(): boolean {
        return this.evalMap[this.getEvalKey()] !== undefined;
    }

    toggleShowAnswer(): QuizState {
        const copy: QuizState = this.copy();
        copy.showingAnswer = !copy.showingAnswer;
        return copy;
    }

    chooseMc(): QuizState {
        const copy: QuizState = this.copy();
        copy.highlightChoice = !copy.highlightChoice;
        return copy;
    }
}
