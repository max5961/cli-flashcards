import { useApp } from "ink";
import { useEffect } from "react";

type GetData<T> = (exit: (() => void) | null) => Promise<T>;
type SetData<T> = (t: T | null) => void;

export function useLoadData<Data>(
    getData: GetData<Data>,
    setData: SetData<Data>,
) {
    const { exit } = useApp();

    async function updateData(): Promise<void> {
        const data: Data = await getData(exit);
        setData(data);
    }

    useEffect(() => {
        updateData();
    }, []);
}
