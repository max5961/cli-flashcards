import React from "react";
import { Text } from "ink";
import { Eval } from "../../QuizMode/QuizState.js";

interface IconProps {
    type?: "MERGE" | "QUIZ" | "EDIT" | "ADD";
    questionEval?: Eval;
}

export function Icon({ type, questionEval = undefined }: IconProps) {
    if (type === "MERGE") {
        return <Text color="cyanBright">{"   "}</Text>;
    }

    if (type === "QUIZ") {
        return <Text color="cyanBright">{"   "}</Text>;
    }

    if (type === "EDIT") {
        return <Text color="yellow">{"   "}</Text>;
    }

    if (type === "ADD") {
        return <Text color="green">{"   "}</Text>;
    }

    if (questionEval === "YES") {
        return <Text color="green">{"[  ]"}</Text>;
    }

    if (questionEval === "NO") {
        return <Text color="red">{"[  ]"}</Text>;
    }

    if (questionEval === "UNANSWERED") {
        return <Text dimColor>{"[   ]"}</Text>;
    }

    throw new Error("Unhandled Icon type");
}
