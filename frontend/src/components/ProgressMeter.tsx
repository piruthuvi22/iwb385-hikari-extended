import React, { CSSProperties, useEffect, useRef, useState } from "react";

const ProgressMeter: React.FC<IFlat> = ({
  progress = 0,
  range = { from: 0, to: 100 },
  showMiniCircle = true,
  text = undefined,
  showValue = true,
  sign = { value: "%", position: "end" },
  sx,
}) => {
  const {
    valueSize = 30,
    valueColor = "#000000",
    valueWeight = "lighter",
    textSize = 13,
    valueFamily = "Trebuchet MS",
    textFamily = "Trebuchet MS",
    textColor = "#000000",
    textWeight = "lighter",
    strokeColor = "#000000",
    barWidth = 5,
    loadingTime = 1000,
    bgStrokeColor = "#ffffff",
    bgColor = { value: "#ffffff", transparency: "00" },
    strokeLinecap = "round",
    shape = "full",
    valueAnimation = true,
    intersectionEnabled = false,
    miniCircleSize = 5,
    miniCircleColor = "#ff0000",
  } = sx;

  const [afterProgress, setAfterProgress] = useState(0);
  const flatRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const { isVisible } = useIntersection(flatRef);
  const setShape = (): number => {
    switch (shape) {
      case "full":
        return 100;
      case "threequarters":
        return 75;
      case "half":
        return 50;
    }
  };

  const setRotate = (): string => {
    switch (shape) {
      case "full":
        return "rotate(-90, 55, 55)";
      case "threequarters":
        return "rotate(135, 55, 55)";
      case "half":
        return "rotate(180, 55, 55)";
    }
  };

  const setRatio = (): number => {
    switch (shape) {
      case "full":
        return 1;
      case "threequarters":
        return 0.75;
      case "half":
        return 0.5;
    }
  };

  const setAngle = (): number => {
    switch (shape) {
      case "full":
        return 0;
      case "threequarters":
        return 135;
      case "half":
        return 90;
    }
  };

  const { animatedValue } = useAnimatedValue(
    prevCountRef.current / setRatio(),
    afterProgress / setRatio(),
    loadingTime
  );

  useEffect(() => {
    if ((intersectionEnabled && isVisible) || !intersectionEnabled) {
      setAfterProgress(progress * setRatio());
      prevCountRef.current = afterProgress;
    }
  }, [progress, shape, isVisible]);

  const dasharray = 2 * Math.PI * 50;
  const dashoffset = (1 - (afterProgress + range.from) / range.to) * dasharray;

  return (
    <div ref={flatRef} style={{ position: "relative" }}>
      <svg viewBox="0 0 110 110" style={{ position: "relative", zIndex: 50 }}>
        <circle
          cx="55"
          cy="55"
          r="50"
          style={{
            transition: "stroke-dashoffset ease-in-out",
            transitionDuration: loadingTime.toString().concat("ms"),
          }}
          strokeWidth={sx.barWidth}
          transform={setRotate()}
          fill="none"
          stroke={sx.strokeColor}
          shapeRendering="geometricPrecision"
          strokeLinecap={strokeLinecap}
          strokeDasharray={dasharray}
          strokeDashoffset={dashoffset}
        />
        {showValue && (
          <text
            x="50%"
            y={
              shape === "half"
                ? text !== undefined && text !== ""
                  ? "35%"
                  : "40%"
                : text !== undefined && text !== ""
                ? "45%"
                : "50%"
            }
            fontSize={valueSize}
            fontWeight={valueWeight}
            textAnchor="middle"
            fontFamily={valueFamily}
            fill={valueColor}
          >
            <tspan
              dominantBaseline={
                text !== undefined && text !== "" ? "auto" : "central"
              }
            >
              {sign.position === "start"
                ? sign.value +
                  (valueAnimation ? animatedValue : progress)
                    // .toFixed(2)
                    .toString()
                    .substring(0, 4)
                : (valueAnimation ? animatedValue : progress)
                    // .toFixed(2)
                    .toString()
                    .substring(0, 4)
                    .concat(sign.value)}
            </tspan>
          </text>
        )}
        {text !== undefined && text !== "" && (
          <text
            x="50%"
            y={shape === "half" ? "40%" : showValue ? "55%" : "50%"}
            fontSize={textSize}
            fontWeight={textWeight}
            textAnchor="middle"
            fill={textColor}
            fontFamily={textFamily}
          >
            <tspan
              dominantBaseline={
                showValue ? "hanging" : shape === "half" ? "hanging" : "middle"
              }
            >
              {text}
            </tspan>
          </text>
        )}
      </svg>
      <svg
        viewBox="0 0 110 110"
        style={
          {
            position: "absolute",
            top: 0,
            // zIndex: -10,
            "--ds1": "drop-shadow(0 10px 8px rgb(0 0 0 / 0.04))",
            "--ds2": "drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
            filter: "var(--ds1) var(--ds2)",
            display: "block",
          } as CSSProperties
        }
      >
        <circle
          cx="55"
          cy="55"
          r="50"
          fill="none"
          stroke={sx.bgStrokeColor ?? "white"}
          strokeWidth={sx.barWidth - 0.3}
          strokeDasharray={dasharray}
          strokeLinecap={strokeLinecap}
          strokeDashoffset={(1 - setShape() / 100) * dasharray}
          transform={setRotate()}
          shapeRendering="geometricPrecision"
        />
      </svg>
      {showMiniCircle && (
        <svg
          viewBox="0 0 110 110"
          style={{
            position: "absolute",
            top: 0,
            zIndex: "50",
            transition: "transform ease-in-out",
            MozTransition: "transform ease-in-out",
            transitionDuration: loadingTime.toString().concat("ms"),
            display: "block",
          }}
          transform={`rotate(${
            afterProgress * (3.6 / (range.to / 100)) - setAngle()
          }, 0, 0)`}
        >
          <circle
            cx="55"
            cy="5"
            r={miniCircleSize}
            fill={miniCircleColor}
          ></circle>
        </svg>
      )}
      <svg
        viewBox="0 0 110 110"
        style={{ position: "absolute", top: "0", zIndex: "30" }}
      >
        <circle
          cx="55"
          cy="55"
          r={50 - sx.barWidth / 2}
          fill={`${bgColor.value + bgColor.transparency}`}
        />
      </svg>
    </div>
  );
};

export default ProgressMeter;

const useAnimatedValue = (
  prev: number,
  current: number,
  duration: number
): { animatedValue: number } => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const diff = current - prev;
  useEffect(() => {
    const countEffect = (): void => {
      if (diff >= 0) {
        if (prev <= current) {
          setAnimatedValue(prev);
          prev++;
        } else {
          clearInterval(interval);
        }
      } else {
        if (prev >= current) {
          setAnimatedValue(prev);
          prev--;
        } else {
          clearInterval(interval);
        }
      }
    };
    const interval = setInterval(countEffect, duration / Math.abs(diff));
  }, [current]);
  return { animatedValue };
};

type UseIntersection = (
  divReference: React.RefObject<HTMLDivElement>,
  threshold?: number
) => { isVisible: boolean };

const useIntersection: UseIntersection = (divReference, threshold = 1) => {
  const [isVisible, setIsVisible] = useState(false);
  const options = {
    root: null,
    rootMargin: "0px",
    threshold,
  };
  const load = (e: IntersectionObserverEntry[]): void => {
    if (e[0].isIntersecting) {
      setIsVisible(true);
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(load, options);
    observer.observe(divReference.current as HTMLDivElement);
  }, []);
  return { isVisible };
};

export interface IFlat {
  progress: number;
  range?: { from: number; to: number };
  text?: string;
  sign?: { value: string; position: SignPosition };
  showValue?: boolean;
  showMiniCircle?: boolean;
  sx: {
    strokeColor: string;
    bgStrokeColor?: string;
    bgColor?: { value: string; transparency: string };
    barWidth: number;
    shape?: FlatShape;
    strokeLinecap?: StrokeLineCap;
    valueSize?: number;
    valueWeight?: FontWeight;
    valueColor?: string;
    valueFamily?: FontFamily;
    textSize?: number;
    textWeight?: FontWeight;
    textColor?: string;
    textFamily?: FontFamily;
    loadingTime?: number;
    miniCircleColor?: string;
    miniCircleSize?: number;
    valueAnimation?: boolean;
    intersectionEnabled?: boolean;
  };
}

export type SignPosition = "start" | "end";

type StrokeLineCap = "butt" | "round" | "square";
type FlatShape = "full" | "threequarters" | "half";
type HeatShape = "threequarters" | "half";
type FontWeight = "normal" | "bold" | "bolder" | "lighter";
type FontFamily =
  | "Fredoka"
  | "Arial"
  | "Arial Black"
  | "Arial Narrow"
  | "Arial Rounded MT Bold"
  | "Arial Unicode MS"
  | "Calibri"
  | "Candara"
  | "Century Gothic"
  | "Comic Sans MS"
  | "Courier New"
  | "Geneva"
  | "Georgia"
  | "Gill Sans"
  | "Helvetica"
  | "Impact"
  | "Lucida Console"
  | "Lucida Grande"
  | "Lucida Sans Unicode"
  | "Palatino Linotype"
  | "Tahoma"
  | "Times New Roman"
  | "Trebuchet MS"
  | "Verdana"
  | "Webdings"
  | "Wingdings";
