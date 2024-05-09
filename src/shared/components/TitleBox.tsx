import React from "react";
import { Box, Text } from "ink";

interface TitleBoxProps {
    title: string;
    children?: React.ReactNode;
}

export function TitleBox({ title, children }: TitleBoxProps): React.ReactNode {
    return (
        <Box justifyContent="space-around" alignItems="center">
            <Text color="yellow" dimColor bold>
                {title}
            </Text>
            {children}
        </Box>
    );
}
