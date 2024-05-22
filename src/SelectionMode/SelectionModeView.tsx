import React from "react";
import { Quiz } from "../types.js";
import { Window } from "../shared/hooks/useWindow.js";
import { FocusableBox } from "../shared/components/Focusable.js";
import { Box, Text } from "ink";
import { TitleBox } from "../shared/components/TitleBox.js";
import { Icon } from "../shared/components/Icons.js";
import { ErrorMessage } from "../shared/components/ErrorMessage.js";
import { useSelectionMode } from "./useSelectionMode.js";

interface CqvProps {
    quizzes: Quiz[];
}

export function SelectionModeView({ quizzes }: CqvProps): React.ReactNode {
    const { getMergeAllText, window, currIndex, page, invalid } =
        useSelectionMode(quizzes);

    function mapItems(items: any[]): React.ReactNode[] {
        const built: React.ReactNode[] = [];

        built.push(
            <FocusableBox isFocus={currIndex === 0} key={0}>
                <Box>
                    <Icon type="MERGE" />
                    <Text>{getMergeAllText()}</Text>
                </Box>
            </FocusableBox>,
        );

        // i + 1 because the first listItem is the All Box
        const isFocus = (i: number): boolean => i + 1 === currIndex;
        for (let i = 0; i < items.length; ++i) {
            built.push(
                <FocusableBox isFocus={isFocus(i)} key={i + 1}>
                    <Box>
                        <Icon type="QUIZ" />
                        <Text>{page.getItemDesc(i)}</Text>
                    </Box>
                </FocusableBox>,
            );
        }

        return built;
    }

    return (
        <>
            <TitleBox title={page.title}>
                <ErrorMessage
                    isError={invalid.errorMessage !== ""}
                    message={invalid.errorMessage}
                />
            </TitleBox>
            <Window
                items={mapItems(page.listItems!)}
                window={window}
                currIndex={currIndex}
                scrollColor="#009293"
                scrollBorder="round"
                scrollMiddle={false}
                scrollPosition="right"
                flexDirection="column"
            />
        </>
    );
}
