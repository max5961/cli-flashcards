import { useRef, useState } from "react";
import { useInput } from "ink";
import { Command, InsertKb, NormalKb } from "../utils/KeyBinds.js";

type HandleKeyBinds = (command: Command | null) => void;

export interface KbState {
    register: string;
    command: Command | null;
}

export function useKeyBinds(
    handleKeyBinds: HandleKeyBinds,
    normal: boolean,
): KbState {
    const normalKb = useRef<NormalKb>(new NormalKb());
    const insertKb = useRef<InsertKb>(new InsertKb());

    const [kbState, setKbState] = useState<KbState>({
        command: null,
        register: "",
    });

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
        handleKeyBinds(command);

        setKbState({
            register: normalKb.current.getRegister(),
            command: command,
        });
    });

    return kbState;
}
