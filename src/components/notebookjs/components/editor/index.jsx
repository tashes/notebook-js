import React from "react";

export default function Editor({
    editors = [],
    current = "",
    data = {},
    currentBlock = {},
    modifyBlock = () => {},
    close = () => {},
}) {
    let CurrentEditor = editors.find((e) => e.label === current);
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <CurrentEditor
                data={data}
                currentBlock={currentBlock}
                modifyBlock={modifyBlock}
                close={close}
            />
        </div>
    );
}
