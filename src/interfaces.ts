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

export interface Section {
    name: string;
    questions: (QA | QI | MC)[];
}

export interface Questions {
    sections: Section[];
}

export interface QuizFileData {
    fileName: string;
    quiz: Questions;
}
