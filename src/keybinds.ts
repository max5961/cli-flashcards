import { Key } from "ink";

interface KeyBindsProps {
    currIndex: number;
    setCurrIndex: (n: number) => void;
    normal: boolean;
    setNormal: (b: boolean) => void;
    maxIndex: number;
    minIndex: number;
}

export class KeyBinds {
    currIndex: number;
    setCurrIndex: (n: number) => void;
    normal: boolean;
    setNormal: (b: boolean) => void;
    maxIndex: number;
    minIndex: number;

    constructor({
        currIndex,
        setCurrIndex,
        normal,
        setNormal,
        maxIndex,
        minIndex,
    }: KeyBindsProps) {
        this.currIndex = currIndex;
        this.setCurrIndex = setCurrIndex;
        this.normal = normal;
        this.setNormal = setNormal;
        this.maxIndex = maxIndex;
        this.minIndex = minIndex;
    }

    default(input: string, key: Key): void {
        if (this.normal && (key.downArrow || input === "j")) {
            if (this.currIndex >= this.maxIndex) return;
            this.setCurrIndex(this.currIndex + 1);
        }

        if (this.normal && (key.upArrow || input === "k")) {
            if (this.currIndex === 0) return;
            this.setCurrIndex(this.currIndex - 1);
        }
    }
}
