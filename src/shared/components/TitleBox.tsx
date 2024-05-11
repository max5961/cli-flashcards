import React from "react";
import { Box, Text } from "ink";
import { WhichMode } from "../../App.js";
import { HorizontalLine } from "./Lines.js";

interface TitleBoxProps {
    title: string;
    mode: WhichMode;
    children?: React.ReactNode;
}

export function TitleBox({
    title,
    children,
    mode,
}: TitleBoxProps): React.ReactNode {
    let modeText: string = "";
    if (mode === "CHOOSE_QUIZ") {
        modeText = "Selection Mode";
    } else if (mode === "EDIT") {
        modeText = "Edit Mode";
    } else if (mode === "START") {
        modeText = "";
    }

    return (
        <Box flexDirection="column" justifyContent="space-around">
            <Box alignSelf="flex-start">
                <Text dimColor>{modeText}</Text>
            </Box>
            <HorizontalLine />
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
            >
                <Text color="yellow" dimColor bold>
                    {title}
                </Text>
                {children}
            </Box>
        </Box>
    );
}
