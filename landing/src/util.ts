import { useEffect, useState } from "react";

export const useIntersection = (element: any, rootMargin: string) => {
  const [isVisible, setState] = useState(false);

  useEffect(() => {
    const current = element?.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting);
      },
      { rootMargin }
    );
    current && observer?.observe(current);

    return () => current && observer.unobserve(current);
  }, []);

  return isVisible;
};

export function useDelayUnmount(isMounted: boolean, delayTime: number) {
  const [ shouldRender, setShouldRender ] = useState(false);

  useEffect(() => {
      let timeoutId: number;
      if (isMounted && !shouldRender) {
          setShouldRender(true);
      }
      else if(!isMounted && shouldRender) {
          timeoutId = setTimeout(
              () => setShouldRender(false),
              delayTime
          );
      }
      return () => clearTimeout(timeoutId);
  }, [isMounted, delayTime, shouldRender]);
  return shouldRender;
}
