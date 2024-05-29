import React from "react";
import { useState, useEffect } from "react";
import { Box } from "ink";

export interface WindowState {
    start: number;
    end: number;
    mid: number;
    windowSize: number;
}

export interface WindowControl {
    windowState: WindowState;
    setWindowState: (ws: WindowState) => void;
}

type WindowDestructure = {
    window: WindowControl;
    currIndex: number;
    setCurrIndex: (n: number) => void;
    resetWindow: () => void;
};

export function useWindow(windowSize: number): WindowDestructure {
    const [currIndex, setCurrIndex] = useState<number>(0);

    const startWindowState = {
        start: currIndex,
        end: windowSize,
        mid: Math.floor(windowSize / 2),
        windowSize: windowSize,
    };

    const [windowState, setWindowState] =
        useState<WindowState>(startWindowState);

    return {
        window: { windowState: windowState, setWindowState: setWindowState },
        currIndex: currIndex,
        setCurrIndex: setCurrIndex,
        resetWindow: () => setWindowState(startWindowState),
    };
}

type BorderStyle =
    | "singleDouble"
    | "bold"
    | "double"
    | "classic"
    | "round"
    | "single"
    | "arrow"
    | "doubleSingle";
type FlexDirection = "column" | "row";
type ScrollPosition = "left" | "right" | "top" | "bottom";

export interface WindowProps {
    items: React.ReactNode[] | React.ReactElement[];
    currIndex: number;
    window: WindowControl;
    scrollMiddle?: boolean;
    scrollBar?: boolean;
    scrollColor?: string;
    scrollBorder?: BorderStyle;
    flexDirection?: FlexDirection;
    scrollPosition?: ScrollPosition;
}
export function Window({
    items,
    currIndex,
    window,
    scrollMiddle = false,
    scrollBar = true,
    scrollColor = "white",
    scrollBorder = "single",
    scrollPosition = "right",
    flexDirection = "column",
}: WindowProps): React.ReactElement {
    const { windowState, setWindowState } = window;
    let { start, end, mid } = windowState;

    // get the start / end indexes of the window
    useEffect(() => {
        let modified: boolean = false;

        // keep current list item in middle
        if (scrollMiddle) {
            const getMid = (s: number, e: number) => Math.floor((s + e) / 2);
            if (currIndex < windowState.mid) {
                while (start > 0 && currIndex !== mid) {
                    --start;
                    --end;
                    mid = getMid(start, end);

                    modified = true;
                }
            } else if (currIndex > windowState.mid) {
                while (end < items.length && currIndex !== mid) {
                    ++start;
                    ++end;
                    mid = getMid(start, end);

                    modified = true;
                }
            }
        } else {
            if (currIndex === end) {
                if (end < items.length) {
                    ++start;
                    ++end;
                    modified = true;
                }
            } else if (currIndex === start - 1) {
                if (start > 0) {
                    --start;
                    --end;
                    modified = true;
                }

                // handle edge cases where the currIndex starts outside the bounds
                // of the window
            } else if (end < currIndex || start > currIndex) {
                while (end > currIndex && start > 0) {
                    --start;
                    --end;
                    modified = true;
                }
                while (start < currIndex && end < items.length) {
                    ++start;
                    ++end;
                    modified = true;
                }
            }
        }

        // update the state of the Window if changes were made
        if (modified) {
            setWindowState({
                start: start,
                end: end,
                mid: mid,
                windowSize: windowState.windowSize,
            });
        }
    }, [currIndex]);

    // use the start and end indexes to slice the input array
    const slicedComponents = items.slice(start, end);

    // Build the scroll component
    let scroll: React.ReactElement;
    // if the window size exceeds the length of the window, there is no need for
    // a scroll bar
    if (windowState.windowSize < items.length && scrollBar) {
        scroll = (
            <Scroller
                window={window}
                length={items.length}
                scrollColor={scrollColor}
                scrollBorder={scrollBorder}
                flexDirection={flexDirection}
            />
        );
    } else {
        scroll = <></>;
    }

    let outerFlex: FlexDirection;
    let innerFlex: FlexDirection;
    switch (flexDirection) {
        case "column":
            outerFlex = "row";
            innerFlex = "column";
            break;
        case "row":
            outerFlex = "column";
            innerFlex = "row";
            break;
    }

    return (
        <Box flexDirection={outerFlex}>
            {scrollPosition === "left" || scrollPosition === "top" ? (
                scroll
            ) : (
                <></>
            )}
            <Box flexDirection={innerFlex} flexGrow={1}>
                {slicedComponents}
            </Box>
            {scrollPosition === "right" || scrollPosition === "bottom" ? (
                scroll
            ) : (
                <></>
            )}
        </Box>
    );
}

function Scroller({
    window,
    length,
    scrollColor,
    scrollBorder,
    flexDirection,
}: {
    window: WindowControl;
    length: number;
    scrollColor: string;
    scrollBorder: BorderStyle;
    flexDirection: FlexDirection;
}): React.ReactElement {
    const { windowState } = window;
    const { start, end } = windowState;

    const sGap = start;
    const mGap = end - start - 1;
    const eGap = length - end;

    let sPercent = sGap / length > 0 ? sGap / length : 0;
    let mPercent = mGap / length > 0 ? mGap / length : 0;
    let ePercent = eGap / length > 0 ? eGap / length : 0;

    if (sPercent === 0) {
        ePercent = 1 - mPercent;
    }

    if (ePercent === 0) {
        sPercent = 1 - mPercent;
    }

    const height: string = flexDirection === "column" ? "100%" : "";
    const width: string = flexDirection === "row" ? "100%" : "";

    return (
        <>
            <Box
                flexDirection={flexDirection}
                height={height}
                width={width}
                padding={0}
            >
                <Box flexGrow={sPercent} margin={0} padding={0}></Box>
                <Box
                    flexGrow={mPercent}
                    borderStyle={scrollBorder}
                    borderColor={scrollColor}
                    margin={0}
                    padding={0}
                ></Box>
                <Box flexGrow={ePercent} margin={0} padding={0}></Box>
            </Box>
        </>
    );
}
