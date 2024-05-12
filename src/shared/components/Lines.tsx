import React from "react";
import { Box } from "ink";

interface LineProps {
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
}
export function HorizontalLine({
    marginTop = 0,
    marginBottom = 0,
}: LineProps): React.ReactNode {
    return (
        <Box
            width="100%"
            borderStyle="single"
            marginTop={marginTop}
            marginBottom={marginBottom}
            borderTop={true}
            borderRight={false}
            borderLeft={false}
            borderBottom={false}
        ></Box>
    );
}

export function VerticalLine({
    marginLeft = 0,
    marginRight = 0,
}: LineProps): React.ReactNode {
    return (
        <Box
            height="100%"
            borderStyle="single"
            marginLeft={marginLeft}
            marginRight={marginRight}
            borderTop={false}
            borderRight={true}
            borderLeft={false}
            borderBottom={false}
        ></Box>
    );
}
