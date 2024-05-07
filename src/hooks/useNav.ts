import { useEffect, useState } from "react";
import { Nav } from "../utils/Nav.js";
import { useInput } from "ink";

type GetInitializer<T, Data> = (d: Data) => (nav: Nav<T>) => void;

export function useNav<T, Data>(
    data: Data,
    getInitializer: GetInitializer<T, Data>,
) {
    const initialNav: Nav<T> = new Nav<T>(getInitializer(data));

    const [nav, setNav] = useState<Nav<T>>(initialNav);
    const [currNode, setCurrNode] = useState<T>(nav.getCurrNode());

    useEffect(() => {
        const nextNav = new Nav<T>(getInitializer(data));
        if (nextNav.returnIfValid(currNode)) {
            nextNav.goTo(currNode);
        }
        setCurrNode(nextNav.getCurrNode());
        setNav(nextNav);
    }, [data]);

    return { nav, currNode, setCurrNode };
}
