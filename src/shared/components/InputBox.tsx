import React from "react";
import TextInput from "ink-text-input";
import { Text } from "ink";

interface InputBox {
    acceptsInput: boolean;
    defaultText: string;
    value: string;
    onChange: (s: string) => void;
    defaultTextColor?: string;
}

// acceptsInput === true means return a dynamic TextInput component, otherwise
// return a static Text component.  The defaultText should represent some state
// that the TextInput component will help to update.
export function InputBox({
    acceptsInput,
    value,
    onChange,
    defaultText,
    defaultTextColor = "",
}: InputBox): React.ReactNode {
    if (acceptsInput) {
        return <TextInput value={value} onChange={onChange}></TextInput>;
    }

    return <Text color={defaultTextColor}>{defaultText}</Text>;
}
