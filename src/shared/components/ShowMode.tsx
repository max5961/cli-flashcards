import React from "react";
import { Box, Text } from "ink";

interface ShowModeProps {
    normal: boolean;
}

export function ShowMode({ normal }: ShowModeProps): React.ReactNode {
    const mode: string = normal ? "--NORMAL--" : "--INSERT--";

    return (
        <Box borderStyle="round" flexShrink={1}>
            <Text dimColor>{mode}</Text>
        </Box>
    );
}
