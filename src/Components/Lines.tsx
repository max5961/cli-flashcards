import React from "react";
import { Box } from "ink";

export function HorizontalLine(): React.ReactElement {
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
