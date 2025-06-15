// Function to convert Draft.js inline styles to our application format
export function convertFromDraftToInlineStyles(rawInlineStyles) {
    return rawInlineStyles.map((style) => ({
        offset: style.offset,
        length: style.length,
        style: style.style,
    }));
}

// Helper function to get the current selection bounds
export function getSelectionBounds() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const bounds = range.getBoundingClientRect();

    // Only return bounds if they're valid (non-zero width/height)
    if (bounds.width === 0 && bounds.height === 0) {
        return null;
    }

    return {
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
        bottom: bounds.bottom,
    };
}

export function isCmdOS() {
    return navigator.platform === "MacIntel";
}

export function deepEquals(...items) {
    let equal = (a, b) => {
        if (a === b) return true;

        if (a && b && typeof a == "object" && typeof b == "object") {
            if (a.constructor !== b.constructor) return false;
            var length, i, keys;
            if (Array.isArray(a)) {
                length = a.length;
                if (length != b.length) return false;
                for (i = length; i-- !== 0; )
                    if (!equal(a[i], b[i])) return false;
                return true;
            }

            if (a instanceof Map && b instanceof Map) {
                if (a.size !== b.size) return false;
                for (i of a.entries()) if (!b.has(i[0])) return false;
                for (i of a.entries())
                    if (!equal(i[1], b.get(i[0]))) return false;
                return true;
            }

            if (a instanceof Set && b instanceof Set) {
                if (a.size !== b.size) return false;
                for (i of a.entries()) if (!b.has(i[0])) return false;
                return true;
            }

            if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
                length = a.length;
                if (length != b.length) return false;
                for (i = length; i-- !== 0; ) if (a[i] !== b[i]) return false;
                return true;
            }

            if (a.constructor === RegExp)
                return a.source === b.source && a.flags === b.flags;

            if (a.valueOf !== Object.prototype.valueOf)
                return a.valueOf() === b.valueOf();

            if (a.toString !== Object.prototype.toString)
                return a.toString() === b.toString();

            keys = Object.keys(a);
            length = keys.length;
            if (length !== Object.keys(b).length) return false;
            for (i = length; i-- !== 0; )
                if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
                    return false;
            for (i = length; i-- !== 0; ) {
                var key = keys[i];

                if (key === "_owner" && a.$$typeof) {
                    continue;
                }
                if (!equal(a[key], b[key])) return false;
            }
            return true;
        }

        // true if both NaN, false otherwise
        return a !== a && b !== b;
    };

    if (items.length === 0) return false;

    let first = items[0];
    for (let i = 1; i < items.length; i++) {
        if (!equal(first, items[i])) return false;
    }

    return true;
}
