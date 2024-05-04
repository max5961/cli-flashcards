import React from "react";
import TextInput from "ink-text-input";
import { Text } from "ink";

interface InputBox {
    acceptsInput: boolean;
    value: string;
    onChange: (s: string) => void;
    defaultText: string;
    textColor?: string;
}

export function InputBox({
    acceptsInput,
    value,
    onChange,
    defaultText,
    textColor = "",
}: InputBox): React.ReactNode {
    // return TextInput
    if (acceptsInput) {
        return <TextInput value={value} onChange={onChange}></TextInput>;
    }

    // return normal Text
    return <Text color={textColor}>{defaultText}</Text>;
}
