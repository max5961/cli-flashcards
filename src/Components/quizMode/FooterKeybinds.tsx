import React from "react";
import { Box, Text } from "ink";

export function FooterKeybinds({
    columns,
}: {
    columns: number;
}): React.ReactElement {
    return (
        <Box
            alignSelf="center"
            borderStyle="round"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
            flexDirection={columns <= 200 ? "column" : "row"}
        >
            <Text>[q / Esc: quit]</Text>
            <Text>[f: flip card]</Text>
            <Text>[n / l: next card]</Text>
            <Text>[b / h: previous card]</Text>
            <Text>[Enter: choose multiple choice answer]</Text>
            <Text>[up arrow / k: move up]</Text>
            <Text>[down arrow / j: move down]</Text>
        </Box>
    );
}
