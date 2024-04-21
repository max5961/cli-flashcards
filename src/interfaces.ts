export interface QA {
    type: "qa";
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
    questions: (QA | MC)[];
}

export interface Questions {
    sections: Section[];
}
