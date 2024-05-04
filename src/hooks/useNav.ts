import { useEffect, useState } from "react";
import { Nav } from "../utils/Nav.js";
import { useInput } from "ink";

type GetInitializer<T, Data> = (d: Data) => (nav: Nav<T>) => void;

export function useNav<T, Data>(
    data: Data,
    getInitializer: GetInitializer<T, Data>,
    normal: boolean = true,
): T {
    const initialNav: Nav<T> = new Nav<T>(getInitializer(data));

    const [nav, setNav] = useState<Nav<T>>(initialNav);
    const [currNode, setCurrNode] = useState<T>(nav.getCurrNode());

    useEffect(() => {
        const nextNav = new Nav<T>(getInitializer(data));
        setNav(nextNav);
    }, [data]);

    useInput((input, key) => {
        if (!normal) {
            return;
        }

        if (key.downArrow || input === "j") {
            nav.moveDown();
        } else if (key.upArrow || input === "k") {
            nav.moveUp();
        } else if (key.leftArrow || input === "h") {
            nav.moveLeft();
        } else if (key.rightArrow || input === "l") {
            nav.moveRight();
        } else {
            return;
        }

        setCurrNode(nav.getCurrNode());
    });

    return currNode;
}
