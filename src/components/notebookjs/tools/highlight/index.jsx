import { Highlighter } from "lucide-react";
import React from "react";

export default {
    styles: [
        {
            name: "HIGHLIGHT_GREEN",
            styles: {
                backgroundColor: "#d5f5e3",
                color: "#1e8449",
            },
            icon: <div className="w-4 h-4 bg-[#d5f5e3]"></div>,
        },
        {
            name: "HIGHLIGHT_RED",
            styles: {
                backgroundColor: "#fadbd8",
                color: "#922b21",
            },
            icon: <div className="w-4 h-4 bg-[#fadbd8]"></div>,
        },
        {
            name: "HIGHLIGHT_YELLOW",
            styles: {
                backgroundColor: "#fdebd0",
                color: "#9c640c",
            },
            icon: <div className="w-4 h-4 bg-[#fdebd0]"></div>,
        },
        {
            name: "HIGHLIGHT_GRAY",
            styles: {
                backgroundColor: "#d6dbdf",
                color: "#2c3e50",
            },
            icon: <div className="w-4 h-4 bg-[#d6dbdf]"></div>,
        },
    ],
    constants: ["PERSISTENT", "GROUP"],
    label: "Highlight",
    icon: <Highlighter />,
};
