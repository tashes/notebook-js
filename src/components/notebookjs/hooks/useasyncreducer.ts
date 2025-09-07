import { useReducer, useRef, useCallback, useMemo } from "react";

export function useAsyncReducer<R extends (state: any, action: any) => any>(
  reducer: R,
  initialArg: any,
  lazyInitializer?: () => any,
): [any, (action: any) => void] {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const initialState = useMemo(() => (typeof lazyInitializer === "function" ? lazyInitializer() : initialArg), []);
  const stateRef = useRef<any>(initialState);
  const dispatch = useCallback((action: any) => {
    try {
      const result = reducer(stateRef.current, action);
      if (result instanceof Promise) {
        result
          .then((newState: any) => {
            stateRef.current = newState;
            forceUpdate(0);
          })
          .catch((err: any) => {
            console.error("Async reducer error:", err);
          });
      } else {
        stateRef.current = result;
        forceUpdate(0);
      }
    } catch (err) {
      console.error("Reducer error:", err);
    }
  }, [reducer]);
  return [stateRef.current, dispatch];
}
