import React from "react";
import { useState } from "react";
import { Box } from "ink";
import cliBoxes from "cli-boxes/index.js";

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

type WindowDestructure = [WindowControl, number, (n: number) => void];

export function useWindow(windowSize: number): WindowDestructure {
    const [currIndex, setCurrIndex] = useState<number>(0);
    const [windowState, setWindowState] = useState<WindowState>({
        start: 0,
        end: windowSize,
        mid: Math.floor(windowSize / 2),
        windowSize: windowSize,
    });

    return [
        { windowState: windowState, setWindowState: setWindowState },
        currIndex,
        setCurrIndex,
    ];
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

export interface WindowProps {
    items: any[];
    currIndex: number;
    window: WindowControl;
    scrollBar?: boolean;
    scrollColor?: string;
    scrollBorder?: BorderStyle;
}
export function Window({
    items,
    currIndex,
    window,
    scrollBar = true,
    scrollColor = "white",
    scrollBorder = "single",
}: WindowProps): React.ReactElement {
    const { windowState, setWindowState } = window;
    let { start, end, mid } = windowState;

    // get the start / end indexes of the window
    let modified: boolean = false;
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

    // update the state of the Window if changes were made
    if (modified) {
        setWindowState({
            start: start,
            end: end,
            mid: mid,
            windowSize: windowState.windowSize,
        });
    }

    // use the start and end indexes to slice the input array
    const slicedItems: React.ReactElement[] = items.slice(start, end);

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
            />
        );
    } else {
        scroll = <></>;
    }

    return (
        <Box flexDirection="row">
            <Box flexDirection="column" flexGrow={1}>
                {slicedItems}
            </Box>
            {scroll}
        </Box>
    );
}

function Scroller({
    window,
    length,
    scrollColor,
    scrollBorder,
}: {
    window: WindowControl;
    length: number;
    scrollColor: string;
    scrollBorder: BorderStyle;
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
    // <Text>{`${sPercent}, ${mPercent}, ${ePercent}`}</Text>;

    return (
        <>
            <Box flexDirection="column" height="100%">
                <Box flexGrow={sPercent} margin={0}></Box>
                <Box
                    flexGrow={mPercent}
                    borderStyle={scrollBorder}
                    borderColor={scrollColor}
                    margin={0}
                ></Box>
                <Box flexGrow={ePercent} margin={0}></Box>
            </Box>
        </>
    );
}
