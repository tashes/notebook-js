import { Link, Link2 } from "lucide-react";
import React from "react";

export default {
    component: (props) => {
        const { contentState, entityKey, children } = props;
        const data = contentState.getEntity(entityKey).getData();
        function isMacPlatform() {
            if (navigator.userAgentData) {
                return navigator.userAgentData.platform === "macOS";
            }
            // Fallback for browsers without userAgentData
            return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
        }

        let handleClick = (e) => {
            if (isMacPlatform()) {
                if (e.metaKey) {
                    window.open(data.url, data.target || "_self");
                }
            } else {
                if (e.ctrlKey) {
                    window.open(data.url, data.target || "_self");
                }
            }
        };
        return (
            <div
                className="relative group/link inline-block z-10"
                onClick={handleClick}
            >
                <div className="border border-border bg-muted rounded-md px-2 py-1 mx-1 inline-block cursor-pointer hover:bg-accent">
                    {props.children}
                </div>
                <div
                    contentEditable={false}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-max whitespace-nowrap bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                    Left Click + {isMacPlatform() ? "⌘" : "Ctrl"} to open link
                </div>
            </div>
        );
    },
    styles: [
        {
            name: "LINK",
            styles: {},
        },
    ],
    constants: ["NON-PERSISTENT", "IMMUTABLE"],
    data: (selectedText, references) => {
        return {
            url: selectedText,
            target: "_self",
        };
    },
    label: "Link",
    icon: <Link />,
};
