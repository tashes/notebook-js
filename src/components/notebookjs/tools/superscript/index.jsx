import { Superscript } from "lucide-react";
import React from "react";

export default {
    styles: [
        {
            name: "SUPERSCRIPT",
            styles: {
                verticalAlign: "super",
                fontSize: "smaller",
            },
        },
    ],
    constants: ["NON-PERSISTENT"],
    label: "Superscript",
    icon: <Superscript />,
};
