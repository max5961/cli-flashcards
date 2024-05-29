import React from "react";
import { MC, Question } from "../types.js";
import { Box, Text } from "ink";
import { HorizontalLine } from "../shared/components/Lines.js";
import { TitleBox } from "../shared/components/TitleBox.js";
import { FocusableBox } from "../shared/components/Focusable.js";
import { Icon } from "../shared/components/Icons.js";
import { PreviewQst } from "../App.js";

const typeMap = {
    mc: "Multiple Choice",
    qa: "Question Answer",
    qi: "Question Input",
} as const;

export function Preview({
    previewQst,
}: {
    previewQst: PreviewQst;
}): React.ReactNode {
    const { question, isPage, isShowing } = previewQst;

    if (!isPage || !isShowing) {
        return <></>;
    }

    return (
        <Box
            flexDirection="column"
            borderStyle="round"
            width={35}
            alignSelf="flex-start"
            padding={0.75}
            paddingBottom={2}
        >
            <TitleBox title="Preview" justifyContent="center" />
            {question && question !== "ADD" ? (
                <PreviewContents question={question} />
            ) : (
                <FocusableBox isFocus={true}>
                    <Icon type="ADD" />
                    <Text>Add Question</Text>
                </FocusableBox>
            )}
        </Box>
    );
}

function PreviewContents({
    question,
}: {
    question: Question;
}): React.ReactNode {
    let choices: React.ReactNode = <></>;
    if (question.type === "mc") {
        choices = getMc(question);
    }

    return (
        <Box flexDirection="column" paddingLeft={0.25} paddingRight={0.25}>
            <Box>
                <Text color="blue">Type: </Text>
                <Text>{typeMap[question.type]}</Text>
            </Box>
            <HorizontalLine />
            <Text color="blue">Question</Text>
            <HorizontalLine />
            <Box>
                <Text>{question.q}</Text>
            </Box>
            <HorizontalLine />
            <Text color="blue">Answer</Text>
            <HorizontalLine />
            <Box>
                <Text>{question.a}</Text>
            </Box>
            <HorizontalLine />
            {choices}
        </Box>
    );
}

function getMc(question: MC): React.ReactNode[] {
    return question.choices.map((choice: string, index: number) => {
        return (
            <Box key={index}>
                <Text>{`${String.fromCharCode(65 + index)}: ${choice}`}</Text>
            </Box>
        );
    });
}
