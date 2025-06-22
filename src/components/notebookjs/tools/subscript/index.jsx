import { Subscript } from "lucide-react";
import React from "react";

export default {
    styles: [
        {
            name: "SUBSCRIPT",
            styles: {
                verticalAlign: "sub",
                fontSize: "smaller",
            },
        },
    ],
    constants: ["NON-PERSISTENT"],
    label: "Subscript",
    icon: <Subscript />,
};
