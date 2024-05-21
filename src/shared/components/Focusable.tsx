import React from "react";
import { Box, Text } from "ink";

interface FocusableBoxProps {
    isFocus: boolean;
    children: React.ReactNode;
    borderColor?: string;
    defaultBorderColor?: string;
    width?: string;
    flexDirection?:
        | "row"
        | "column"
        | "row-reverse"
        | "column-reverse"
        | undefined;
    alignItems?: "center" | "flex-start" | "flex-end" | "stretch";
    paddingLeft?: number;
    paddingRight?: number;
}

export function FocusableBox({
    isFocus,
    children,
    borderColor = "blue",
    defaultBorderColor = "",
    width = "100%",
    flexDirection = "row",
    alignItems = "center",
    paddingLeft = 1,
    paddingRight = 1,
}: FocusableBoxProps): React.ReactNode {
    return (
        <Box
            borderStyle={isFocus ? "bold" : "round"}
            borderColor={isFocus ? borderColor : defaultBorderColor}
            flexGrow={1}
            width={width}
            flexDirection={flexDirection}
            alignItems={alignItems}
            paddingLeft={paddingLeft}
            paddingRight={paddingRight}
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
