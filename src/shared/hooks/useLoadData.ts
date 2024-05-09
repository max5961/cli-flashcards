import { useEffect } from "react";

type GetData<T> = () => Promise<T>;
type SetData<T> = (t: T | null) => void;

export function useLoadData<Data>(
    getData: GetData<Data>,
    setData: SetData<Data>,
) {
    async function updateData(): Promise<void> {
        const data: Data = await getData();
        setData(data);
    }

    useEffect(() => {
        updateData();
    }, []);
}
