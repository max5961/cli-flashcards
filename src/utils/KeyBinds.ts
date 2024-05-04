import { Key, useInput } from "ink";

type Command = "up" | "down" | "left" | "right" | "enter" | "delete";

class UserInput {
    private register: string;
    private normal: boolean;
    private command: Command | null;

    constructor(input: string, key: Key) {
        this.register = "";
        this.normal = true;
        this.command = null;
    }
}
