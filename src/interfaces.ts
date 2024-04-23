/**
 * {
 *   quizzes: [
 *      QuizFileData
 *   ]
 * }
 * */
export interface QuizData {
    quizzes: QuizFileData[];
}

/**
 * {
 *   fileName: string
 *   quiz: Quiz
 * }
 */
export interface QuizFileData {
    fileName: string;
    quiz: Quiz;
}

/**
 * {
 *   sections: Section[]
 * }
 */
export interface Quiz {
    sections: Section[];
}

/**
 * {
 *     name: string;
 *     questions: Question[]
 * }
 */
export interface Section {
    name: string;
    questions: Question[];
}

export type Question = QA | QI | MC;

/**
 * {
 *     type: "qa",
 *     q: string,
 *     a: string,
 * }
 */
export interface QA {
    type: "qa";
    q: string;
    a: string;
}
/**
 * {
 *     type: "qi",
 *     q: string,
 *     a: string,
 * }
 */
export interface QI {
    type: "qi";
    q: string;
    a: string;
}
/**
 * {
 *     type: "qi",
 *     q: string,
 *     a: string,
 *     choices: [
 *          {"MARKER": "CHOICE_DESC"}
 *     ]
 * }
 */
export interface MC {
    type: "mc";
    q: string;
    a: string;
    choices: { [key: string]: string }[];
}
