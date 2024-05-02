export class Opt<T> {
    public name: T;
    public left: Opt<T> | null;
    public right: Opt<T> | null;
    public up: Opt<T> | null;
    public down: Opt<T> | null;

    constructor(name: T) {
        this.name = name;
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
    }

    setUp(toLink: Opt<T>): void {
        this.up = toLink;
    }

    setDown(toLink: Opt<T>): void {
        this.down = toLink;
    }

    setLeft(toLink: Opt<T>): void {
        this.left = toLink;
    }

    setRight(toLink: Opt<T>): void {
        this.right = toLink;
    }
}

export class Nav<T> {
    private curr: Opt<T>;
    private optMap: Map<T, Opt<T>> = new Map();

    constructor(navConfig: (n: Nav<T>) => Opt<T>) {
        this.curr = navConfig(this);
    }

    addNode(name: T): Opt<T> {
        this.optMap.set(name, new Opt(name));
        return this.optMap.get(name)!;
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

    getCurr(): T {
        return this.curr.name;
    }

    getNode(name: T): Opt<T> {
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
