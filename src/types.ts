export interface Quiz {
    fileName: string;
    sections: Section[];
}

export interface Section {
    name: string;
    questions: Question[];
}

export type Question = QA | QI | MC;

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
    choices: string[];
}

export interface QuestionData {
    type: "qa" | "qi" | "mc";
    q: string;
    a: string;
    choices: string[];
}

export type choice = "A" | "B" | "C" | "D";
