import { useEffect, useState } from "react";
import { Nav } from "../utils/Nav.js";

type GetInitializer<T, Data> = (d: Data) => (nav: Nav<T>) => void;

export function useNav<T, Data>(
    data: Data,
    getInitializer: GetInitializer<T, Data>,
) {
    const initialNav: Nav<T> = new Nav<T>(getInitializer(data));

    const [nav, setNav] = useState<Nav<T>>(initialNav);

    useEffect(() => {
        const nextNav = new Nav<T>(getInitializer(data));
        const currNode: T = nextNav.getCurrNode();
        if (nextNav.returnIfValid(currNode)) {
            nextNav.goTo(currNode);
        }
        setNav(nextNav);
    }, [data]);

    return { nav };
}
