import { useContext, useRef } from "react";
import { useInput } from "ink";
import { Command, InsertKb, NormalKb } from "../utils/KeyBinds.js";
import { AppContext } from "../../App.js";

type HandleKeyBinds = (command: Command | null) => void;

export function useKeyBinds(handleKeyBinds: HandleKeyBinds): void {
    const { normal } = useContext(AppContext)!;

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

        handleKeyBinds(command);
    });
}
