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
    | "UNDO";

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

    setCommand(command: Command): void {
        this.clearRegister();
        this.command = command;
    }

    handleStdInput(input: string, key: Key): void {
        this.clearCommand();
        this.handleInput(input);
        this.handleKeyInput(key);
    }

    handleInput(input: string) {
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

        if (this.register === "u") {
            this.setCommand("UNDO");
        }

        if (this.register === "dd") {
            this.setCommand("DELETE");
        }

        if (this.register === "cc") {
            this.setCommand("CLEAR");
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
