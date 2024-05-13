import React from "react";
import { Box } from "ink";

interface FocusableBoxProps {
    isFocus: boolean;
    children: React.ReactNode;
    borderColor?: string;
}

export function FocusableBox({
    isFocus,
    children,
    borderColor = "blue",
}: FocusableBoxProps): React.ReactNode {
    return (
        <Box
            borderStyle={isFocus ? "bold" : "round"}
            borderColor={isFocus ? borderColor : ""}
            flexGrow={1}
        >
            {children}
        </Box>
    );
}
