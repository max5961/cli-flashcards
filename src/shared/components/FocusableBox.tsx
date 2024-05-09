import React from "react";
import { Box } from "ink";

interface FocusableBoxProps {
    isFocus: boolean;
    children: React.ReactNode;
}

export function FocusableBox({
    isFocus,
    children,
}: FocusableBoxProps): React.ReactNode {
    return (
        <Box
            borderStyle={isFocus ? "bold" : "round"}
            borderColor={isFocus ? "blue" : ""}
            flexGrow={1}
        >
            {children}
        </Box>
    );
}
