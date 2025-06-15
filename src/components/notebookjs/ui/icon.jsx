import React from "react";

export default function Icon({ icon = "", className = "", ...props }) {
    const svg = Icons[icon];
    if (!svg) return null;

    // Merge any existing className on the SVG with the one passed in.
    return React.cloneElement(svg, {
        className: [svg.props.className, className].filter(Boolean).join(" "),
        ...props,
    });
}

const Icons = {
    AddRow: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Table outline with three equal rows */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="14"
                x2="15"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Plus sign in #27ae60, shifted right 2 units for spacing */}
            <line
                x1="19"
                y1="10"
                x2="19"
                y2="14"
                stroke="#27ae60"
                strokeWidth="2"
            />
            <line
                x1="17"
                y1="12"
                x2="21"
                y2="12"
                stroke="#27ae60"
                strokeWidth="2"
            />
        </svg>
    ),

    AddColumn: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Table outline with three equal columns */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <line
                x1="7"
                y1="4"
                x2="7"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="11"
                y1="4"
                x2="11"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Plus sign in #27ae60, shifted right 2 units for spacing */}
            <line
                x1="19"
                y1="10"
                x2="19"
                y2="14"
                stroke="#27ae60"
                strokeWidth="2"
            />
            <line
                x1="17"
                y1="12"
                x2="21"
                y2="12"
                stroke="#27ae60"
                strokeWidth="2"
            />
        </svg>
    ),

    GroupCells: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer table frame */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* Only show outer borders, no internal borders */}
            <rect
                x="4"
                y="5"
                width="10"
                height="13"
                stroke="none"
                fill="none"
                strokeWidth="0"
            />
        </svg>
    ),

    UngroupCells: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer table frame */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* Show internal borders */}
            <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="14"
                x2="15"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="9"
                y1="4"
                x2="9"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    ),

    MergeCells: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer table frame */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* Horizontal dividers for three equal rows */}
            <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="14"
                x2="15"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Vertical divider for two columns, only in top and bottom rows */}
            <line
                x1="9"
                y1="4"
                x2="9"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="9"
                y1="14"
                x2="9"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    ),

    UnmergeCells: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer table frame */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* Horizontal dividers for three rows */}
            <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="14"
                x2="15"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Vertical divider only in the middle row (top & bottom merged) */}
            <line
                x1="9"
                y1="9"
                x2="9"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    ),

    DeleteRow: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Table outline with three equal rows */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="14"
                x2="15"
                y2="14"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Minus sign in #c0392b, shifted right 2 units for spacing */}
            <line
                x1="17"
                y1="12"
                x2="21"
                y2="12"
                stroke="#c0392b"
                strokeWidth="2"
            />
        </svg>
    ),

    DeleteColumn: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Table outline with three equal columns */}
            <rect
                x="3"
                y="4"
                width="12"
                height="15"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />
            <line
                x1="7"
                y1="4"
                x2="7"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="11"
                y1="4"
                x2="11"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Minus sign in #c0392b, shifted right for spacing */}
            <line
                x1="17"
                y1="12"
                x2="21"
                y2="12"
                stroke="#c0392b"
                strokeWidth="2"
            />
        </svg>
    ),

    ClearContent: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Checkbox outline with the top-right corner cut out */}
            <path
                d="M3 3 H13
           M3 3 V21 H21 V11"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* X in the corner */}
            <line
                x1="14"
                y1="4"
                x2="20"
                y2="10"
                stroke="#c0392b"
                strokeWidth="2.5"
            />
            <line
                x1="20"
                y1="4"
                x2="14"
                y2="10"
                stroke="#c0392b"
                strokeWidth="2.5"
            />
        </svg>
    ),

    ClearSelection: (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Corner L shapes */}
            {/* Top-left */}
            <line
                x1="3"
                y1="4"
                x2="3"
                y2="8"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="4"
                x2="7"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Top-right */}
            <line
                x1="15"
                y1="4"
                x2="11"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="15"
                y1="4"
                x2="15"
                y2="8"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Bottom-right */}
            <line
                x1="15"
                y1="19"
                x2="15"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="15"
                y1="19"
                x2="11"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Bottom-left */}
            <line
                x1="3"
                y1="19"
                x2="7"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="3"
                y1="19"
                x2="3"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Dashed segments */}
            <line
                x1="7"
                y1="4"
                x2="11"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 2"
            />
            <line
                x1="15"
                y1="8"
                x2="15"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 2"
            />
            <line
                x1="11"
                y1="19"
                x2="7"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 2"
            />
            <line
                x1="3"
                y1="15"
                x2="3"
                y2="8"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 2"
            />

            {/* "X" to clear selection */}
            <line
                x1="6"
                y1="8"
                x2="12"
                y2="14"
                stroke="#c0392b"
                strokeWidth="2"
            />
            <line
                x1="12"
                y1="8"
                x2="6"
                y2="14"
                stroke="#c0392b"
                strokeWidth="2"
            />
        </svg>
    ),

    ToggleHeader: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Left vertical stem of the "H" */}
            <line
                x1="6"
                y1="5"
                x2="6"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Right vertical stem of the "H" */}
            <line
                x1="18"
                y1="5"
                x2="18"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
            />
            {/* Crossbar of the "H" */}
            <line
                x1="6"
                y1="12"
                x2="18"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    ),
};
