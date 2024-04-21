// credit to:
// https://github.com/cameronhunter/ink-monorepo/blob/master/packages/ink-use-stdout-dimensions/src/index.ts
// (was not importing correctly)
import { useEffect, useState } from "react";
import { useStdout } from "ink";

export default function useStdoutDimensions(): [number, number] {
    const { stdout } = useStdout();
    const [dimensions, setDimensions] = useState<[number, number]>([
        stdout.columns,
        stdout.rows,
    ]);

    useEffect(() => {
        const handler = () => setDimensions([stdout.columns, stdout.rows]);
        stdout.on("resize", handler);
        return () => {
            stdout.off("resize", handler);
        };
    }, [stdout]);

    return dimensions;
}

// export = useStdoutDimensions;
