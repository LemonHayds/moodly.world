"use client";

import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";

const ExpandableTextArea = ({
  value,
  onChange,
  className,
  disabled = false,
  singleLine = false,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  singleLine?: boolean;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number>(48);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    if (textareaRef.current) {
      const computedStyle = window.getComputedStyle(textareaRef.current);
      const lineHeight = parseInt(computedStyle.lineHeight);
      const threeLines = lineHeight * 5;
      setMaxHeight(threeLines);
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.target;

    target.style.height = "auto";

    const newHeight = Math.min(target.scrollHeight, maxHeight);
    target.style.height = `${newHeight}px`;
    setHeight(newHeight);

    if (target.scrollHeight > maxHeight) {
      target.scrollTop = target.scrollHeight;
    }

    onChange(event);
  };

  return (
    <div
      className={`relative w-full ${
        disabled ? "select-none pointer-events-none" : ""
      }`}
      style={{ userSelect: "none" }}
    >
      {singleLine ? (
        <div
          onClick={(e) => {
            if (disabled) e.stopPropagation();
          }}
          style={{ userSelect: "none" }}
        >
          <div
            className={`h-fit select-none opacity-70 border-none bg-transparent text-base sm:text-lg py-3.5 sm:py-2.5 leading-[22px] sm:leading-[26px] h-[52px] sm:h-[48px] block w-full ${className} pr-[10px]`}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              pointerEvents: disabled ? "none" : "auto",
              userSelect: "none",
              touchAction: "none",
            }}
            contentEditable={false}
          >
            {value}
          </div>
        </div>
      ) : (
        <Textarea
          maxLength={350}
          disabled={disabled}
          ref={textareaRef}
          placeholder=""
          className={`h-fit border-none resize-none bg-transparent text-base sm:text-lg py-3.5 sm:py-2.5 leading-[22px] sm:leading-[26px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 h-[52px] sm:h-[48px] min-h-[52px] sm:min-h-[48px] block w-full ${className}`}
          rows={1}
          style={{
            overflowY:
              height &&
              textareaRef &&
              textareaRef.current &&
              textareaRef.current.scrollHeight > maxHeight
                ? "auto"
                : "hidden",
            pointerEvents: disabled ? "none" : "auto",
            userSelect: "none",
            touchAction: "none",
          }}
          value={value}
          onInput={handleInput}
        />
      )}
    </div>
  );
};

export default ExpandableTextArea;
