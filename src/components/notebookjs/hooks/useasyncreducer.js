import { useReducer, useRef, useCallback, useMemo } from "react";

export function useAsyncReducer(reducer, initialArg, lazyInitializer) {
    // Force re-render
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    // Initialize state via lazy initializer or direct value
    const initialState = useMemo(
        () =>
            typeof lazyInitializer === "function"
                ? lazyInitializer()
                : initialArg,
        [],
    );

    const stateRef = useRef(initialState);

    const dispatch = useCallback(
        (action) => {
            try {
                const result = reducer(stateRef.current, action);

                if (result instanceof Promise) {
                    result
                        .then((newState) => {
                            stateRef.current = newState;
                            forceUpdate();
                        })
                        .catch((err) => {
                            console.error("Async reducer error:", err);
                        });
                } else {
                    stateRef.current = result;
                    forceUpdate();
                }
            } catch (err) {
                console.error("Reducer error:", err);
            }
        },
        [reducer],
    );

    return [stateRef.current, dispatch];
}
