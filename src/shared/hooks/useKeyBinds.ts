import { useContext, useRef } from "react";
import { useApp, useInput } from "ink";
import { Command, InsertKb, NormalKb } from "../utils/KeyBinds.js";
import { AppContext, WhichMode } from "../../App.js";

type HandleKeyBinds = (command: Command | null) => void;

export interface KbState {
    register: string;
    command: Command | null;
}

export function useKeyBinds(handleKeyBinds: HandleKeyBinds, normal: boolean) {
    const { setMode, setKbState } = useContext(AppContext)!;
    const { exit } = useApp();
    const normalKb = useRef<NormalKb>(new NormalKb());
    const insertKb = useRef<InsertKb>(new InsertKb());

    useInput((input, key) => {
        let normalCommand: Command | null = null;
        let insertCommand: Command | null = null;

        if (normal) {
            normalKb.current.handleStdInput(input, key);
            normalCommand = normalKb.current.getCommand();
        } else {
            insertKb.current.handleStdInput(input, key);
            insertCommand = insertKb.current.getCommand();
        }

        const command: Command | null = normalCommand || insertCommand || null;

        handleGlobalCommands(command, exit, setMode);
        handleKeyBinds(command);

        setKbState({
            register: normalKb.current.getRegister(),
            command: command,
        });
    });
}

function handleGlobalCommands(
    command: Command | null,
    exit: () => void,
    setMode: (m: WhichMode) => void,
): void {
    if (command === "QUIT") {
        exit();
    }

    if (command === "GO_TO_START_MENU") {
        setMode("START");
    }

    if (command === "GO_TO_SELECTION_VIEW") {
        setMode("SELECT");
    }

    if (command === "GO_TO_EDIT_VIEW") {
        setMode("EDIT");
    }
}
