import React from 'react';

export function useResizeObserver(elementRef: React.RefObject<Element>): ResizeObserverEntry | undefined {
  const [entry, setEntry] = React.useState<ResizeObserverEntry>();

  React.useEffect(() => {
    const node = elementRef?.current;
    if (!node) return;

    const updateEntry = ([entry]: ResizeObserverEntry[]): void => {
      setEntry(entry);
    };

    const observer = new ResizeObserver(updateEntry);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef]);

  return entry;
}
