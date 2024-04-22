export interface QA {
    type: "qa";
    q: string;
    a: string;
}

export interface QI {
    type: "qi";
    q: string;
    a: string;
}

export interface MC {
    type: "mc";
    q: string;
    a: string;
    choices: { [key: string]: string }[];
}

export type Question = QA | QI | MC;

export interface Section {
    name: string;
    questions: Question[];
}

export interface Quiz {
    sections: Section[];
}

export interface QuizFileData {
    fileName: string;
    quiz: Quiz;
}
