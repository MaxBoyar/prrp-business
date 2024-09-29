import { useEffect, useState } from "react";

export function useLocalStorageState<T>(
    localStorageKey: string,
    initialValue: T
): [T, (value: T) => void] {
    const [state, setState] = useState<T>(() => {
        const storedState = localStorage.getItem(localStorageKey);
        return storedState ? JSON.parse(storedState) as T : initialValue;
    });

    useEffect(() => {
        const storedState = localStorage.getItem(localStorageKey);
        if (storedState !== null) {
            setState(JSON.parse(storedState) as T);
        }
    }, [localStorageKey]);

    const handleStateChange = (value: T): void => {
        setState(value);
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    };

    return [state, handleStateChange];
}