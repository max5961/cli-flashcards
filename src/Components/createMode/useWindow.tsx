import { useState } from "react";
import React from "react";

export interface WindowState {
    start: number;
    setStart: (s: number) => void;
    end: number;
    setEnd: (e: number) => void;
    mid: number;
    setMid: (m: number) => void;
}

export function useWindow(windowSize: number): WindowState {
    const [start, setStart] = useState<number>(0);
    const [end, setEnd] = useState<number>(start + (windowSize - 1));
    const [mid, setMid] = useState<number>(Math.floor((start + end) / 2));

    return {
        start: start,
        setStart: setStart,
        end: end,
        setEnd: setEnd,
        mid: mid,
        setMid: setMid,
    };
}

export interface WindowProps {
    items: any[];
    currIndex: number;
    window: WindowState;
}
export function Window({
    items,
    currIndex,
    window,
}: WindowProps): React.ReactElement[] {
    const { start, setStart, end, setEnd, mid, setMid } = window;

    let startCopy = start;
    let endCopy = end;
    let midCopy = mid;

    let modified: boolean = false;
    const getMid = (s: number, e: number) => Math.floor((s + e) / 2);
    if (currIndex < mid) {
        while (startCopy > 0 && currIndex !== midCopy) {
            --startCopy;
            --endCopy;
            midCopy = getMid(startCopy, endCopy);

            modified = true;
        }
    } else if (currIndex > mid) {
        while (end < items.length - 1 && currIndex !== midCopy) {
            ++startCopy;
            ++endCopy;
            midCopy = getMid(startCopy, endCopy);

            modified = true;
        }
    }

    if (modified) {
        setStart(startCopy);
        setEnd(endCopy);
        setMid(midCopy);
    }

    return items.slice(startCopy, endCopy + 1);
}
