import { useState } from "react";
import React from "react";

export interface WindowState {
    start: number;
    end: number;
    mid: number;
}

export interface WindowControl {
    windowState: WindowState;
    setWindowState: (ws: WindowState) => void;
}

export function useWindow(windowSize: number): WindowControl {
    const [windowState, setWindowState] = useState<WindowState>({
        start: 0,
        end: windowSize,
        mid: Math.floor(windowSize / 2),
    });

    return { windowState: windowState, setWindowState: setWindowState };
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

    let startCopy = windowState.start;
    let endCopy = windowState.end;
    let midCopy = windowState.mid;

    let modified: boolean = false;
    const getMid = (s: number, e: number) => Math.floor((s + e) / 2);
    if (currIndex < windowState.mid) {
        while (startCopy > 0 && currIndex !== midCopy) {
            --startCopy;
            --endCopy;
            midCopy = getMid(startCopy, endCopy);

            modified = true;
        }
    } else if (currIndex > windowState.mid) {
        while (endCopy < items.length && currIndex !== midCopy) {
            ++startCopy;
            ++endCopy;
            midCopy = getMid(startCopy, endCopy);

            modified = true;
        }
    }

    if (modified) {
        setWindowState({
            start: startCopy,
            end: endCopy,
            mid: midCopy,
        });
    }

    return items.slice(startCopy, endCopy);
}
