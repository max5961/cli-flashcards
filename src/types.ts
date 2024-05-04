export interface Quiz {
    fileName: string;
    sections: Section[];
}

export interface Section {
    name: string;
    questions: Question[];
}

export type Question = QA | QI | MC;
export type QuestionTypes = "qa" | "qi" | "mc";

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

export interface FlexibleQuestion {
    type: "qa" | "qi" | "mc";
    q: string;
    a: string;
    choices: string[];
}

export type McChoice = "A" | "B" | "C" | "D";
