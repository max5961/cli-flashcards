import React from "react";
import { Box, Text } from "ink";

interface FocusableBoxProps {
    isFocus: boolean;
    children: React.ReactNode;
    borderColor?: string;
    defaultBorderColor?: string;
}

export function FocusableBox({
    isFocus,
    children,
    borderColor = "blue",
    defaultBorderColor = "",
}: FocusableBoxProps): React.ReactNode {
    return (
        <Box
            borderStyle={isFocus ? "bold" : "round"}
            borderColor={isFocus ? borderColor : defaultBorderColor}
            flexGrow={1}
        >
            {children}
        </Box>
    );
}

interface FocusableTextProps {
    isFocus: boolean;
    textContent: string;
    focusColor?: string;
    defaultColor?: string;
}
export function FocusableText({
    isFocus,
    textContent,
    focusColor = "blue",
    defaultColor = "",
}: FocusableTextProps): React.ReactNode {
    let picked: string = " ";
    let color: string = defaultColor;
    if (isFocus) {
        picked = ">";
        color = focusColor;
    }

    return (
        <Box>
            <Text color={color}>{`${picked} ${textContent}`}</Text>
        </Box>
    );
}
