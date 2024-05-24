import { useEffect, useState } from "react";

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

export class NavNode<T> {
    public name: T;
    public left: NavNode<T> | null;
    public right: NavNode<T> | null;
    public up: NavNode<T> | null;
    public down: NavNode<T> | null;

    constructor(name: T) {
        this.name = name;
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
    }

    setUp(toLink: NavNode<T>): void {
        this.up = toLink;
    }

    setDown(toLink: NavNode<T>): void {
        this.down = toLink;
    }

    setLeft(toLink: NavNode<T>): void {
        this.left = toLink;
    }

    setRight(toLink: NavNode<T>): void {
        this.right = toLink;
    }
}

export class Nav<T> {
    private curr!: NavNode<T>;
    private optMap: Map<T, NavNode<T> | null> = new Map();

    constructor(navConfig: (n: Nav<T>) => void) {
        // the constructor assumes that the callback will handle the task of
        // setting the position of the curr pointer
        navConfig(this);
    }

    addNode(name: T): NavNode<T> {
        this.optMap.set(name, new NavNode(name));
        return this.optMap.get(name)!;
    }

    removeNode(name: T): void {
        const toRemove: NavNode<T> = this.optMap.get(name)!;
        const up: NavNode<T> = toRemove.up!;
        const down: NavNode<T> = toRemove.down!;

        down.setUp(up);
        up.setDown(down);

        this.optMap.set(name, null);
    }

    insertNode(name: T, upNames: T[]): void {
        const newNode: NavNode<T> = this.addNode(name);

        upNames.forEach((name) => {
            const upNode: NavNode<T> = this.getNode(name)!;
            newNode.setUp(upNode);
            newNode.setDown(upNode.down!);
            newNode.down!.setUp(newNode);
            upNode.down = newNode;
        });
    }

    moveUp(): void {
        if (this.curr.up) {
            this.curr = this.curr.up;
        }
    }

    moveDown(): void {
        if (this.curr.down) {
            this.curr = this.curr.down;
        }
    }

    moveLeft(): void {
        if (this.curr.left) {
            this.curr = this.curr.left;
        }
    }

    moveRight(): void {
        if (this.curr.right) {
            this.curr = this.curr.right;
        }
    }

    goTo(name: T): void {
        if (this.optMap.has(name)) {
            this.curr = this.optMap.get(name)!;
        } else {
            throw new Error(`name: ${name} is not part of navigation map`);
        }
    }

    getCurrNode(): T {
        return this.curr.name;
    }

    getNode(name: T): NavNode<T> {
        if (!this.optMap.has(name)) {
            throw new Error(`name: ${name} is not part of navigation map`);
        }
        return this.optMap.get(name)!;
    }

    returnIfValid(name: T): T | null {
        if (this.optMap.has(name)) {
            return name;
        } else {
            return null;
        }
    }
}
