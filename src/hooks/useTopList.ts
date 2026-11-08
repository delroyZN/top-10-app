"use client";

import { useCallback, useEffect, useState } from "react";
import type { EnrichedTopList } from "@/lib/schema";
import { ApiError, requestTopList } from "@/lib/client/api";

type State =
  | { status: "loading" }
  | { status: "ready"; list: EnrichedTopList }
  | { status: "error"; error: ApiError };

/**
 * Shares one request per topic across re-mounts (React Strict Mode runs
 * effects twice in development), so we never pay for a duplicate list.
 */
const requests = new Map<string, Promise<EnrichedTopList>>();

function load(topic: string) {
  let p = requests.get(topic);
  if (!p) {
    p = requestTopList(topic);
    requests.set(topic, p);
    // Failed requests shouldn't stick around; let "Try again" re-fetch.
    p.catch(() => requests.delete(topic));
  }
  return p;
}

export function useTopList(topic: string) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    load(topic).then(
      (list) => active && setState({ status: "ready", list }),
      (err) =>
        active &&
        setState({
          status: "error",
          error: err instanceof ApiError ? err : new ApiError("internal", "Something went wrong."),
        }),
    );
    return () => {
      active = false;
    };
  }, [topic, attempt]);

  const retry = useCallback(() => {
    requests.delete(topic);
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, [topic]);

  return { ...state, retry };
}
