"use client";

import { useEffect, useState } from "react";

interface DownloadState {
  progress: number; // 0..100
  done: boolean;
}

// Streams a file over the network purely to warm the browser HTTP cache and
// report honest progress. This is the *actual* heavy load the loader buys time
// for — decoding/GPU upload happens later, once the loader hands off, so the
// intro animation never competes with it for the main thread.
export function useAssetDownload(url: string): DownloadState {
  const [state, setState] = useState<DownloadState>({ progress: 0, done: false });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const total = Number(res.headers.get("Content-Length")) || 0;
        const reader = res.body.getReader();
        let received = 0;

        // Drain the stream so bytes land in the HTTP cache; track progress.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value?.length ?? 0;
          if (!cancelled && total) {
            setState({
              progress: Math.min((received / total) * 100, 100),
              done: false,
            });
          }
        }

        if (!cancelled) setState({ progress: 100, done: true });
      } catch (err) {
        if (cancelled) return;
        // If prefetch fails, don't trap the user on the loader forever —
        // the GLTF loader will retry at mount and surface any real error.
        console.warn("[useAssetDownload] prefetch failed:", err);
        setState({ progress: 100, done: true });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return state;
}
