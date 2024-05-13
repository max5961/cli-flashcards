import React from "react";
import { Text } from "ink";
import { KbState } from "../hooks/useKeyBinds.js";

export function KeyBindState({
    kbState,
}: {
    kbState: KbState;
}): React.ReactNode {
    let color: "" | "red" | "blue" = "";
    if (kbState.register.length > 1) color = "red";

    if (!kbState.command && kbState.register.length > 1) {
        return (
            <Text color={color}>{`Unknown Keybind: ${kbState.register}`}</Text>
        );
    }

    if (!kbState.command) {
        return <Text color={color}>{kbState.register}</Text>;
    }

    return <Text color={color}>{kbState.command.toLowerCase()}</Text>;
}
