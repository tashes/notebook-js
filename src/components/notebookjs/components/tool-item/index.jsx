import { OrderedSet } from "immutable";
import React, { useEffect, useRef, useState } from "react";

export default function ToolItem({
    tool = {},
    currentStyles = OrderedSet([]),
    toggleFn = async () => {},
}) {
    let [showGroup, setShowGroup] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    let isActive = tool.styles
        .map((style) => style.name)
        .some((style) => currentStyles.has(style));

    let currentlyOnStyles = tool.styles
        .map((style) => style.name)
        .filter((style) => currentStyles.has(style));

    let handleToggle = async (e) => {
        e.preventDefault();
        const styleName = tool.styles[0]?.name;
        if (!styleName) return;

        if (isActive) {
            await toggleFn({
                tool,
                styles: currentlyOnStyles,
            });
        } else {
            if (tool.styles.length > 0)
                await toggleFn({
                    tool,
                    styles: [...currentlyOnStyles, tool.styles[0].name],
                });
        }
    };

    let handleSpecificToggle = async (e, style) => {
        e.preventDefault();
        await toggleFn({
            tool,
            styles: [...currentlyOnStyles, style.name],
        });
    };

    let handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowGroup(true);
    };

    let handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowGroup(false);
            timeoutRef.current = null;
        }, 300);
    };

    let createToolItem = (style) => {
        let isActiveSubItem = currentStyles.has(style.name);

        return (
            <button
                key={`${tool.label}-${style.name}`}
                className={`rounded cursor-pointer outline-none hover:scale-[1.5] transition-all duration-100 ${isActiveSubItem ? "border-black border-2" : "border-gray-300 border-transparent border-2"}`}
                onClick={(e) => handleSpecificToggle(e, style)}
            >
                <div className="w-4 h-4 flex items-center justify-center scale-100">
                    {style.icon}
                </div>
            </button>
        );
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={handleToggle}
                className={`p-1 rounded cursor-pointer hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-opacity-50 ${isActive ? `bg-gray-200` : ""}`}
            >
                <div className="w-4 h-4 flex items-center justify-center scale-100">
                    {tool.icon}
                </div>
            </button>
            {tool.constants.some((constant) => constant === "GROUP") &&
                showGroup && (
                    <div
                        className="absolute top-[-2.5rem] left-0 mt-0 p-2 bg-white shadow-md rounded-md border border-gray-200 flex space-x-2 z-10000"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {tool.styles.map((style) => createToolItem(style))}
                    </div>
                )}
        </div>
    );
}
