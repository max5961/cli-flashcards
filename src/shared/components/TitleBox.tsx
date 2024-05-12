import React from "react";
import { Box, Text } from "ink";
import { HorizontalLine } from "./Lines.js";

interface TitleBoxProps {
    title: string;
    children?: React.ReactNode;
}

export function TitleBox({ title, children }: TitleBoxProps): React.ReactNode {
    return (
        <>
            <Box flexDirection="column" justifyContent="space-around">
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
            <HorizontalLine marginBottom={1} />
        </>
    );
}
