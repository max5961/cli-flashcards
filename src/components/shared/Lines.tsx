import React from "react";
import { Box } from "ink";

export function HorizontalLine(): React.ReactNode {
    return (
        <Box
            width="100%"
            borderStyle="single"
            borderTop={true}
            borderRight={false}
            borderLeft={false}
            borderBottom={false}
        ></Box>
    );
}

export function VerticalLine(): React.ReactNode {
    return (
        <Box
            height="100%"
            borderStyle="single"
            borderTop={false}
            borderRight={true}
            borderLeft={false}
            borderBottom={false}
        ></Box>
    );
}
