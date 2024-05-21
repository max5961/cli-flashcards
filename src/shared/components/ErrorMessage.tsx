import React from "react";
import { Box, Text } from "ink";

interface Props {
    isError: boolean;
    message: string;
}

export function ErrorMessage({ isError, message }: Props): React.ReactNode {
    if (!isError) return <></>;
    return (
        <Box
            alignSelf="flex-end"
            flexDirection="column"
            marginLeft={3}
            borderStyle="round"
            borderColor="red"
            paddingLeft={2}
            paddingRight={2}
        >
            <Text color="red">{message}</Text>
        </Box>
    );
}
