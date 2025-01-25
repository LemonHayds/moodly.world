"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import { useTheme } from "next-themes";
import { AmbientLight } from "three";
import { useGlobeAnalytics } from "../../providers/globe-analytics-provider/globe-analytics-client-provider";
import { generateGlobeLabels } from "../../../lib/utils/globe.utils";
import geoJson from "../../../assets/globe/geo.json";

import type {
  GlobePolygonType,
  EmojiGlobeLabel,
} from "../../../lib/types/globe.types";
import { GlobePopover } from "./globe-popover";

export default function NextGlobe() {
  const globeEl = useRef<any>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  console.log("isDark", isDark);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    globalMoods,
    selectedCountry,
    setSelectedCountry,
    setIsModalOpen,
    isModalOpen,
    globeSettings,
  } = useGlobeAnalytics();

  const [isHovering, setIsHovering] = useState(false);
  const [countryMoodLabels, setCountryMoodLabels] = useState<EmojiGlobeLabel[]>(
    []
  );
  const [showCountryMoodLabels, setShowCountryMoodLabels] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pointerEventsEnabled, setPointerEventsEnabled] = useState(true);

  const countryMap = useMemo(() => {
    return new Map(
      //@ts-ignore
      geoJson[0].features.map((f) => [f.properties.ISO_A2, f.properties.ADMIN])
    );
  }, []);

  const getCountryName = useCallback(
    (countryCode: string) => {
      return countryMap.get(countryCode) || "";
    },
    [countryMap]
  );

  // Tooltip position
  useEffect(() => {
    if (!selectedCountry || isModalOpen) {
      setTooltipPosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX,
        y: e.clientY,
      };

      setTooltipPosition((prev) => {
        if (!prev || prev.x !== newPosition.x || prev.y !== newPosition.y) {
          return newPosition;
        }
        return prev;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [selectedCountry, isModalOpen]);

  // Auto rotate control
  useEffect(() => {
    if (globeEl.current) {
      if (isHovering || !globeSettings.spinningEnabled) {
        globeEl.current.controls().autoRotate = false;
      } else {
        const timeout = setTimeout(() => {
          if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
          }
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [isHovering, globeSettings.spinningEnabled]);

  // Every time globalMoods changes, generate new labels to display emojis on the globe
  useEffect(() => {
    if (!globeSettings.emojisEnabled) return;

    if (globalMoods) {
      const labels = generateGlobeLabels(globalMoods);

      setCountryMoodLabels(labels);

      const timer = setTimeout(() => {
        setShowCountryMoodLabels(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [globalMoods, globeSettings.emojisEnabled]);

  // Emoji labels on country polygons
  const htmlElementFn = useMemo(() => {
    if (!globeSettings.emojisEnabled) return undefined;

    return (d: any) => {
      const el = document.createElement("div");
      el.style.fontSize = "24px";
      el.style.pointerEvents = "none";
      el.style.position = "relative";
      el.style.transform = "translate(-50%, -50%)";
      el.className = showCountryMoodLabels ? "animate-fade-in" : "opacity-0";
      el.textContent = d.text;
      return el;
    };
  }, [showCountryMoodLabels, globeSettings.emojisEnabled]);

  const htmlElementAltitudeFn = useCallback(
    (d: any) => {
      if (!globeSettings.emojisEnabled) return 0.0;

      if (d.countryCode?.toUpperCase() === selectedCountry?.toUpperCase()) {
        return 0.03;
      }
      return 0.01;
    },
    [selectedCountry, globeSettings.emojisEnabled]
  );

  const handlePolygonHover = useCallback(async (polygon: any) => {
    const countryPolygon = polygon as GlobePolygonType | null;
    if (countryPolygon?.properties?.ISO_A2) {
      document.body.style.cursor = "pointer";
      setSelectedCountry(countryPolygon.properties.ISO_A2);
    } else {
      document.body.style.cursor = "default";
      setTooltipPosition(null);
      setSelectedCountry(null);
    }

    setIsHovering(!!polygon);
  }, []);

  const handlePolygonClick = useCallback(() => {
    if (selectedCountry && !isModalOpen) {
      setIsModalOpen(true);
      document.body.style.cursor = "default";
    } else {
      setIsModalOpen(false);
    }
  }, [selectedCountry, isModalOpen, setIsModalOpen]);

  // Add this new effect to handle dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (globeEl.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    return () => {
      if (globeEl.current) {
        globeEl.current.controls().dispose();
      }
    };
  }, []);

  const globeProps = useMemo(
    () => ({
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: "rgba(0,0,0,0)",
      globeImageUrl: isDark
        ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mMAAwADACoO6NEAAAAASUVORK5CYII="
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
      rendererConfig: {
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        precision: "highp",
      },
      showAtmosphere: true,
      atmosphereColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)",
      polygonsData: geoJson[0].features,
      polygonsTransitionDuration: 300,
      pointOfView: { lat: 0, lng: 0, altitude: 2.5 },
    }),
    [isDark, dimensions]
  );

  const polygonColors = useMemo(
    () => ({
      strokeColor: () => (isDark ? "#000000" : "#ffffff"),
      sideColor: (d: object) => {
        const polygon = d as GlobePolygonType;
        const isSelected = polygon.properties.ISO_A2 === selectedCountry;
        return isSelected ? "#808080" : isDark ? "#ffffff" : "#000000";
      },
      capColor: (d: object) => {
        const polygon = d as GlobePolygonType;
        const isSelected = polygon.properties.ISO_A2 === selectedCountry;
        return isSelected ? "#808080" : isDark ? "#ffffff" : "#000000";
      },
      altitude: (d: object) => {
        const polygon = d as GlobePolygonType;
        const isSelected = polygon.properties.ISO_A2 === selectedCountry;
        return isSelected ? 0.02 : 0.01;
      },
    }),
    [isDark, selectedCountry]
  );

  const handleGlobeReady = useCallback(() => {
    if (!globeEl.current) return;

    const globe = globeEl.current;
    const scene = globe.scene();
    const controls = globe.controls();

    if (globeSettings.spinningEnabled) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }

    // Remove existing lights
    scene.children
      .filter((child: any) => child.type === "DirectionalLight")
      .forEach((light: any) => {
        light.intensity = 0;
      });

    // Add ambient light
    const ambientLight = new AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
  }, []);

  // Disable pointer events when modal is open
  useEffect(() => {
    if (!isModalOpen) {
      setPointerEventsEnabled(false);
      const timer = setTimeout(() => {
        setPointerEventsEnabled(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  return (
    <div
      className={`w-full h-screen relative ${
        !pointerEventsEnabled || isModalOpen ? "pointer-events-none" : ""
      }`}
    >
      <Globe
        ref={globeEl}
        {...globeProps}
        polygonStrokeColor={polygonColors.strokeColor}
        polygonSideColor={polygonColors.sideColor}
        polygonCapColor={polygonColors.capColor}
        polygonAltitude={polygonColors.altitude}
        onPolygonHover={handlePolygonHover}
        onPolygonClick={handlePolygonClick}
        onGlobeReady={handleGlobeReady}
        htmlElementsData={countryMoodLabels}
        htmlElement={htmlElementFn}
        htmlTransitionDuration={250}
        htmlAltitude={htmlElementAltitudeFn}
      />
      {selectedCountry &&
        tooltipPosition &&
        tooltipPosition.x > 0 &&
        tooltipPosition.y > 0 && (
          <GlobePopover
            countryName={getCountryName(selectedCountry)}
            position={tooltipPosition}
          />
        )}
    </div>
  );
}
