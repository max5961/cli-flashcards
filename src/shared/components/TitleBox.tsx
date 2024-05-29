import React from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "./Lines.js";

interface TitleBoxProps {
    title: string;
    children?: React.ReactNode;
    justifyContent?:
        | "space-between"
        | "space-around"
        | "center"
        | "flex-start"
        | "flex-end";
}

export function TitleBox({
    title,
    justifyContent = "space-around",
    children,
}: TitleBoxProps): React.ReactNode {
    return (
        <>
            <Box flexDirection="column" justifyContent="space-around">
                <Box
                    flexDirection="row"
                    justifyContent={justifyContent}
                    alignItems="center"
                    width="100%"
                >
                    <Text color="yellow" dimColor bold>
                        {title}
                    </Text>
                    {children}
                </Box>
            </Box>
            <HorizontalLine marginBottom={1} />
        </>
    );
}
