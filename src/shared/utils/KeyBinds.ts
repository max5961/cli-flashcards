import { Key } from "ink";

export type Command =
    | "QUIT"
    | "UP"
    | "DOWN"
    | "LEFT"
    | "RIGHT"
    | "ENTER_INSERT"
    | "EXIT_INSERT"
    | "GO_TO_START_MENU"
    | "GO_TO_SELECTION_VIEW"
    | "GO_TO_EDIT_VIEW"
    | "GO_TO_QUIZ_VIEW"
    | "MARK_YES"
    | "MARK_NO"
    | "TOGGLE_SHOW_ANSWER"
    | "SHUFFLE_QUESTIONS"
    | "NEXT_QUESTION"
    | "PREV_QUESTION"
    | "CLEAR_TEXT"
    | "DELETE_ITEM"
    | "GO_TO_TOP_OF_LIST"
    | "GO_TO_BOTTOM_OF_LIST"
    | "NEXT_PAGE"
    | "PREV_PAGE"
    | "RETURN_KEY"
    | "DELETE_KEY";

abstract class KeyBinds {
    protected command: Command | null;

    constructor() {
        this.command = null;
    }

    abstract handleStdInput(input: string, key: Key): void;
    abstract setCommand(command: Command): void;

    getCommand(): Command | null {
        return this.command;
    }

    clearCommand(): void {
        this.command = null;
    }
}

export class InsertKb extends KeyBinds {
    constructor() {
        super();
    }

    setCommand(command: Command): void {
        this.command = command;
    }

    handleStdInput(input: string, key: Key): void {
        this.clearCommand();

        if (key.return || key.escape) {
            this.setCommand("EXIT_INSERT");
        }
    }
}

export class NormalKb extends KeyBinds {
    private register: string;

    constructor() {
        super();
        this.register = "";
    }

    clearRegister(): void {
        this.register = "";
    }

    pushRegister(char: string): void {
        if (this.register.length >= 2) {
            this.clearRegister();
        }

        this.register += char;
    }

    getRegister(): string {
        return this.register;
    }

    setCommand(command: Command): void {
        this.clearRegister();
        this.command = command;
    }

    handleStdInput(input: string, key: Key): void {
        this.clearCommand();
        this.handleInput(input, key);
        this.handleKeyInput(key);
    }

    handleInput(input: string, key: Key) {
        this.pushRegister(input);

        if (this.register === "q") {
            this.setCommand("QUIT");
        }

        if (this.register === "j") {
            this.setCommand("DOWN");
        }

        if (this.register === "k") {
            this.setCommand("UP");
        }

        if (this.register === "h") {
            this.setCommand("LEFT");
        }

        if (this.register === "l") {
            this.setCommand("RIGHT");
        }

        if (this.register === "i") {
            this.setCommand("ENTER_INSERT");
        }

        if (this.register === "1") {
            this.setCommand("GO_TO_START_MENU");
        }

        if (this.register === "2") {
            this.setCommand("GO_TO_SELECTION_VIEW");
        }

        if (this.register === "3") {
            this.setCommand("GO_TO_EDIT_VIEW");
        }

        // Quiz Mode
        if (this.register === "S") {
            this.setCommand("SHUFFLE_QUESTIONS");
        }

        // Quiz Mode
        if (this.register === "y" || this.register === " ") {
            this.setCommand("MARK_YES");
        }

        // Quiz Mode
        if (this.register === "n") {
            this.setCommand("MARK_NO");
        }

        // Quiz Mode
        if (this.register === "a") {
            this.setCommand("TOGGLE_SHOW_ANSWER");
        }

        if (this.register === "dd") {
            this.setCommand("DELETE_ITEM");
        }

        if (this.register === "cc") {
            this.setCommand("CLEAR_TEXT");
        }

        if (this.register === "gg") {
            this.setCommand("GO_TO_TOP_OF_LIST");
        }

        if (this.register === "G") {
            this.setCommand("GO_TO_BOTTOM_OF_LIST");
        }
    }

    handleKeyInput(key: Key): void {
        if (key.escape) {
            this.clearRegister();
        }

        if (key.delete) {
            this.setCommand("DELETE_KEY");
        }

        if (key.return) {
            this.setCommand("RETURN_KEY");
        }

        if (key.upArrow) {
            this.setCommand("UP");
        }

        if (key.downArrow) {
            this.setCommand("DOWN");
        }

        if (key.leftArrow) {
            this.setCommand("LEFT");
        }

        if (key.rightArrow) {
            this.setCommand("RIGHT");
        }
    }
}
