import { Key } from "ink";

export type Command =
    | "UP"
    | "DOWN"
    | "LEFT"
    | "RIGHT"
    | "DELETE_KEY"
    | "RETURN_KEY"
    | "ENTER_INSERT"
    | "EXIT_INSERT"
    | "QUIT"
    | "CLEAR"
    | "DELETE"
    | "GO_TO_TOP"
    | "GO_TO_BOTTOM"
    | "TO_START_MENU"
    | "TO_CHOOSE_MENU"
    | "TO_EDIT_MENU"
    | "RANDOMIZE"
    | "MARK_YES"
    | "MARK_NO"
    | "TOGGLE_SHOW_ANSWER";

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
            this.setCommand("TO_START_MENU");
        }

        if (this.register === "2") {
            this.setCommand("TO_CHOOSE_MENU");
        }

        if (this.register === "3") {
            this.setCommand("TO_EDIT_MENU");
        }

        // Quiz Mode
        if (this.register === "rr") {
            this.setCommand("RANDOMIZE");
        }

        // Quiz Mode
        if (this.register === "y") {
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

        // this makes sense for create/edit mode, but not sure about in other
        // contexts
        if (this.register === "e") {
            this.setCommand("ENTER_INSERT");
        }

        if (this.register === "dd") {
            this.setCommand("DELETE");
        }

        if (this.register === "cc") {
            this.setCommand("CLEAR");
        }

        if (this.register === "gg") {
            this.setCommand("GO_TO_TOP");
        }

        if (this.register === "G") {
            this.setCommand("GO_TO_BOTTOM");
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
