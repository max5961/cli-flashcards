import { useState } from "react";
import React from "react";

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

export interface WindowProps {
    items: any[];
    currIndex: number;
    window: WindowControl;
}
export function Window({
    items,
    currIndex,
    window,
}: WindowProps): React.ReactElement[] {
    const { windowState, setWindowState } = window;

    // let startCopy = windowState.start;
    // let endCopy = windowState.end;
    // let midCopy = windowState.mid;

    let { start, end, mid } = windowState;

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

    if (modified) {
        setWindowState({
            start: start,
            end: end,
            mid: mid,
            windowSize: windowState.windowSize,
        });
    }

    return items.slice(start, end);
}
