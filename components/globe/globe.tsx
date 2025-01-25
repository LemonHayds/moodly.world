"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Loader from "../loader";

const NextGlobe = dynamic(
  () => import("./parts/next-globe").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader size={48} />
      </div>
    ),
  }
);

export const GlobeContainer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);
  const resizeTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleResize = () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      clearTimeout(resizeTimer.current);

      setIsVisible(false);

      resizeTimer.current = setTimeout(() => {
        setIsVisible(true);
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer.current);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center z-[1] relative">
      <div className="absolute inset-0">
        {isVisible ? (
          <NextGlobe />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader size={48} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeContainer;
