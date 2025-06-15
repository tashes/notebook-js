import React from "react";

export default {
    name: "Edit Properties",
    shortcut: "Cmd+Shift+P",
    action: (_, { openEditor }) => {
        openEditor("properties", {});
    },
};
