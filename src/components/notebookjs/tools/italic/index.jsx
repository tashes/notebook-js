import { Italic } from "lucide-react";
import React from "react";

export default {
    styles: [
        {
            name: "ITALIC",
            styles: {
                fontStyle: "italic",
            },
        },
    ],
    constants: ["PERSISTENT"],
    label: "Italic",
    icon: <Italic />,
};
