import React from "react";
import { Text } from "ink";

interface IconProps {
    type: "MERGE" | "QUIZ" | "EDIT" | "ADD";
}

export function Icon({ type }: IconProps) {
    if (type === "MERGE") {
        return <Text color="cyanBright">{"  "}</Text>;
    }

    if (type === "QUIZ") {
        return <Text color="cyanBright">{"  "}</Text>;
    }

    if (type === "EDIT") {
        return <Text color="yellow">{"  "}</Text>;
    }

    if (type === "ADD") {
        return <Text color="green">{"  "}</Text>;
    }

    throw new Error("Unhandled Icon type");
}
