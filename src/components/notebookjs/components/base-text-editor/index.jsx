import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    CompositeDecorator,
    ContentState,
    convertToRaw,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    RichUtils,
    SelectionState,
} from "draft-js";
import "draft-js/dist/Draft.css";

import {
    KC_DELETE_BLOCK,
    KC_MOVE_BLOCK_UP,
    KC_MOVE_BLOCK_DOWN,
    KC_SHIFT_FOCUS_UP,
    KC_SHIFT_FOCUS_DOWN,
    KC_CUSTOM_SHORTCUT,
} from "../../data/const";
import {
    convertFromDraftToInlineStyles,
    isCmdOS,
} from "../../utils/draft-helpers";
import InlineToolbar from "../inline-toolbar";
import { codeToKey } from "../../utils/keycode";

// Wrap with forwardRef to expose imperative API via ref
const BaseTextEditor = forwardRef(function BaseTextEditor(
    {
        id = "",
        iText = "",
        iInlineStyles = [],
        blockType = () => {},
        placeholder = "Type something...",
        tools = [],
        references = {
            search: () => {},
            open: () => {},
        },
        readOnly = false,
        shortcuts = [],
        props = {},
        dispatcher = () => {},
    },
    ref,
) {
    // Editor state
    const [editorState, setEditorState] = useState(() => {
        // Create a decorator for tools that need it TODO
        let decorator = new CompositeDecorator([]);

        // Create the contentState from the text
        let contentState;
        try {
            contentState = ContentState.createFromText(iText || "");
        } catch (e) {
            contentState = ContentState.createFromText("");
        }

        // Create the editor state with decorators
        let state = EditorState.createWithContent(contentState, decorator);

        // Apply inline styles if they exist
        if (iInlineStyles && iInlineStyles.length > 0) {
            // Start with the initial state
            let styleState = state;

            // Apply each style one by one
            iInlineStyles.forEach((styleObj) => {
                // Create a selection for the range where the style should be applied
                const selection = styleState.getSelection().merge({
                    anchorOffset: styleObj.offset,
                    focusOffset: styleObj.offset + styleObj.length,
                    hasFocus: false,
                });

                // Create a new state with the selection
                const stateWithSelection = EditorState.forceSelection(
                    styleState,
                    selection,
                );

                // Apply the inline style to the selected text
                const newState = RichUtils.toggleInlineStyle(
                    stateWithSelection,
                    styleObj.style,
                );

                // Update our working state
                styleState = newState;
            });

            // Set the final state with all styles applied
            state = styleState;
        }

        return state;
    });
    // Selection state
    const [hasSelection, setHasSelection] = useState(false);

    // Editor ref
    const editorRef = useRef(null);
    // Editor Wrapper ref
    const editorWrapperRef = useRef(null);

    // Track selection
    useEffect(() => {
        const checkSelection = () => {
            // 1st check if the editor has focus & selection
            if (
                document.activeElement &&
                editorWrapperRef.current?.contains(document.activeElement)
            ) {
                const selection = editorState.getSelection();
                if (!selection.isCollapsed()) {
                    setHasSelection(true);
                    return;
                }
            }

            // 2nd check DOM selection as a fallback
            const selection = window.getSelection();
            if (!selection) {
                setHasSelection(false);
                return;
            }

            // 3rd check if there's a selection within the editor
            if (
                !selection.isCollapsed &&
                selection.rangeCount > 0 &&
                editorWrapperRef.current
            ) {
                const range = selection.getRangeAt(0);
                const isSelectionInEditor = editorWrapperRef.current.contains(
                    range.commonAncestorContainer,
                );
                setHasSelection(isSelectionInEditor);
            } else {
                setHasSelection(false);
            }
        };

        document.addEventListener("selectionchange", checkSelection);
        checkSelection();
        return () => {
            document.removeEventListener("selectionchange", checkSelection);
        };
    }, [editorState]);

    // Create style map
    const styleMap = useMemo(() => {
        return Object.fromEntries(
            tools
                .map((tool) =>
                    tool.styles.map((style) => [style.name, style.styles]),
                )
                .reduce((ass, style) => ass.concat(style), []),
        );
    }, [tools]);

    const styleConstants = useMemo(() => {
        let nonPersistentStyles = tools
            .map((tool) =>
                tool.constants.some((constant) => constant === "NON-PERSISTENT")
                    ? tool.styles.map((style) => style.name)
                    : [],
            )
            .reduce((ass, styles) => ass.concat(styles), []);
        let persistentStyles = tools
            .map((tool) =>
                tool.constants.some((constant) => constant === "PERSISTENT")
                    ? tool.styles.map((style) => style.name)
                    : [],
            )
            .reduce((ass, styles) => ass.concat(styles), []);

        return {
            NON_PERSISTENT_STYLES: nonPersistentStyles,
            PERSISTENT_STYLES: persistentStyles,
        };
    }, [tools]);

    // Evaluate shortcut factory
    const evaluateShortcut = useCallback((shortcut) => {
        let parts = shortcut.indexOf("+")
            ? shortcut.split("+").map((p) => p.toLowerCase())
            : [shortcut.toLowerCase()];
        let useCmd = isCmdOS();
        return (e) => {
            let partials = parts.map((part) => {
                if (part.toLowerCase() === "cmd")
                    return useCmd ? e.metaKey : e.ctrlKey;
                else if (part === "ctrl") return e.ctrlKey;
                else if (part === "shift") return e.shiftKey;
                else if (part === "alt") return e.altKey;
                else return part === codeToKey(e.code).toLowerCase();
            });
            if (
                parts.find((p) => p === "cmd") === undefined &&
                (useCmd ? e.metaKey : e.ctrlKey)
            )
                return false;
            if (parts.find((p) => p === "ctrl") === undefined && e.ctrlKey)
                return false;
            if (parts.find((p) => p === "shift") === undefined && e.shiftKey)
                return false;
            if (parts.find((p) => p === "alt") === undefined && e.altKey)
                return false;
            return partials.every((a) => a === true);
        };
    }, []);

    const shortcutEvaluators = useMemo(() => {
        return shortcuts.map((shortcut) => ({
            shortcut: shortcut.shortcut,
            evaluator: evaluateShortcut(shortcut.shortcut),
            action: shortcut.action,
        }));
    }, [shortcuts, evaluateShortcut]);
    const shortcutEvaluatorsLength = shortcutEvaluators.length;

    const hasPersistentStyle = styleConstants.PERSISTENT_STYLES.some((style) =>
        editorState.getCurrentInlineStyle().has(style),
    );

    const shouldShowInlineToolbar =
        hasSelection ||
        (hasPersistentStyle &&
            editorState.getSelection().isCollapsed() &&
            editorState.getSelection().getHasFocus());

    // Handlers
    // Handle Editor Change
    let handleEditorChange = useCallback(
        (state) => {
            // Track selection state
            const selection = state.getSelection();
            setHasSelection(!selection.isCollapsed());

            // Deal with non-persistent styles
            if (selection.isCollapsed()) {
                const currentInlineStyle = state.getCurrentInlineStyle();
                const hasNonPersistentStyle =
                    styleConstants.NON_PERSISTENT_STYLES.some((style) =>
                        currentInlineStyle.has(style),
                    );

                if (hasNonPersistentStyle) {
                    styleConstants.NON_PERSISTENT_STYLES.forEach((style) => {
                        if (currentInlineStyle.has(style)) {
                            state = RichUtils.toggleInlineStyle(state, style);
                        }
                    });
                }
            }

            // Update the editor state
            setEditorState(state);

            // Extract the text and inline styles
            const contentState = state.getCurrentContent();
            const rawContent = convertToRaw(contentState);
            const text = contentState.getPlainText();
            if (rawContent.blocks && rawContent.blocks.length > 0) {
                const firstBlock = rawContent.blocks[0];
                const rawInlineStyles = firstBlock.inlineStyleRanges || [];
                const inlineStyles =
                    convertFromDraftToInlineStyles(rawInlineStyles);
                dispatcher({
                    type: "base-text-update",
                    id: id,
                    text: text,
                    inlineStyles: inlineStyles,
                });
            }
        },
        [id, dispatcher, styleConstants],
    );

    // Handle Pressing Enter
    let handleReturn = useCallback(
        (e) => {
            const beforeObj = {
                type: "create-new-block",
                position: "before",
                id: id,
                blockType: blockType.followingBlock,
            };
            const afterObj = {
                type: "create-new-block",
                position: "after",
                id: id,
                blockType: blockType.followingBlock,
            };
            const useCmd = isCmdOS();

            if (useCmd) {
                if (e.metaKey && !e.shiftKey) {
                    dispatcher(afterObj);
                    return "handled";
                } else if (e.metaKey && e.shiftKey) {
                    dispatcher(beforeObj);
                    return "handled";
                }
            } else {
                if (e.ctrlKey && !e.shiftKey) {
                    dispatcher(afterObj);
                    return "handled";
                } else if (e.ctrlKey && e.shiftKey) {
                    dispatcher(beforeObj);
                    return "handled";
                }
            }
            return "not-handled";
        },
        [id, dispatcher],
    );

    // Handle Key Commands
    let handleKeyBinding = useCallback((e) => {
        let useCmd = isCmdOS();

        // Cmd+Backspace: Delete Block
        if (
            e.key === "Backspace" &&
            (useCmd ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
        ) {
            e.preventDefault();
            return KC_DELETE_BLOCK;
        }

        // Cmd+Up: Move block up
        if (e.key === "ArrowUp" && (useCmd ? e.metaKey : e.ctrl)) {
            e.preventDefault();
            return KC_MOVE_BLOCK_UP;
        }

        // Cmd+Down: Move block down
        if (e.key === "ArrowDown" && (useCmd ? e.metaKey : e.ctrl)) {
            e.preventDefault();
            return KC_MOVE_BLOCK_DOWN;
        }

        // Shift+Up: Focus up
        if (e.key === "ArrowUp" && e.shiftKey) {
            e.preventDefault();
            return KC_SHIFT_FOCUS_UP;
        }

        // Shift+Down: Focus down
        if (e.key === "ArrowDown" && e.shiftKey) {
            e.preventDefault();
            return KC_SHIFT_FOCUS_DOWN;
        }

        for (let i = 0; i < shortcutEvaluatorsLength; i++) {
            if (shortcutEvaluators[i].evaluator(e) === true) {
                e.preventDefault();
                return (
                    KC_CUSTOM_SHORTCUT + ":" + shortcutEvaluators[i].shortcut
                );
            }
        }

        return getDefaultKeyBinding(e);
    }, [shortcutEvaluators, shortcutEvaluatorsLength]);

    let handleKeyCommand = useCallback((command) => {
        if (command === KC_DELETE_BLOCK) {
            window.getSelection()?.removeAllRanges();
            dispatcher({
                type: "block-delete",
                id: id,
            });
            return "handled";
        }

        if (command === KC_MOVE_BLOCK_UP) {
            window.getSelection()?.removeAllRanges();
            dispatcher({
                type: "block-move",
                dir: "up",
                id: id,
            });
            return "handled";
        }

        if (command === KC_MOVE_BLOCK_DOWN) {
            window.getSelection()?.removeAllRanges();
            dispatcher({
                type: "block-move",
                dir: "down",
                id: id,
            });
            return "handled";
        }

        if (command === KC_SHIFT_FOCUS_UP) {
            window.getSelection()?.removeAllRanges();
            dispatcher({
                type: "focus-move",
                dir: "up",
                id: id,
            });
            return "handled";
        }

        if (command === KC_SHIFT_FOCUS_DOWN) {
            window.getSelection()?.removeAllRanges();
            dispatcher({
                type: "focus-move",
                dir: "down",
                id: id,
            });
            return "handled";
        }

        if (command.split(":")[0] === KC_CUSTOM_SHORTCUT) {
            let evaluator = shortcutEvaluators.find(
                (shortcut) => shortcut.shortcut === command.split(":")[1],
            );
            evaluator.action({
                id: id,
                dispatcher: dispatcher,
                editorState: editorState,
                setEditorState: setEditorState,
                props: props,
                blockType: blockType,
                references: references,
            });
        }
    }, [shortcutEvaluators, dispatcher, id, editorState, setEditorState, props, blockType, references]);

    useImperativeHandle(ref, () => ({
        focusAtStart: () => {
            if (editorRef.current) {
                // Create a new selection at the start of the text
                const contentState = editorState.getCurrentContent();
                const firstBlock = contentState.getFirstBlock();
                const selection = editorState.getSelection().merge({
                    anchorKey: firstBlock.getKey(),
                    anchorOffset: 0,
                    focusKey: firstBlock.getKey(),
                    focusOffset: 0,
                    hasFocus: true,
                });

                // Force the selection and focus the editor
                const newState = EditorState.forceSelection(
                    editorState,
                    selection,
                );
                setEditorState(newState);

                // Focus the editor
                editorRef.current.focus();

                // Scroll into view
                editorWrapperRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }
        },
        focusAtEnd: () => {
            if (editorRef.current) {
                // Create a new selection at the end of the text
                const contentState = editorState.getCurrentContent();
                const lastBlock = contentState.getLastBlock();
                const endOffset = lastBlock.getLength();
                const selection = editorState.getSelection().merge({
                    anchorKey: lastBlock.getKey(),
                    anchorOffset: endOffset,
                    focusKey: lastBlock.getKey(),
                    focusOffset: endOffset,
                    hasFocus: true,
                });

                // Force the selection and focus the editor
                const newState = EditorState.forceSelection(
                    editorState,
                    selection,
                );
                setEditorState(newState);

                // Focus the editor
                editorRef.current.focus();

                // Scroll into view
                editorWrapperRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }
        },
        getCurrentPosition: () => {
            if (editorRef.current) {
                let selection = editorState.getSelection();
                return selection.getAnchorOffset();
            }
        },
        focusAt: (position) => {
            if (editorRef.current) {
                const contentState = editorState.getCurrentContent();
                const lastBlock = contentState.getLastBlock();
                const selection = SelectionState.createEmpty(
                    lastBlock.getKey(),
                ).merge({
                    anchorOffset: position,
                    focusOffset: position,
                    hasFocus: true,
                });
                let newState = EditorState.forceSelection(
                    editorState,
                    selection,
                );
                setEditorState(newState);

                // Focus the editor
                editorRef.current.focus();

                // Scroll into view
                editorWrapperRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }
        },
    }));

    return (
        <div className="relative">
            <div ref={editorWrapperRef} className="cursor-text relative my-1.5">
                <Editor
                    ref={editorRef}
                    editorState={editorState}
                    placeholder={placeholder}
                    readOnly={readOnly === true}
                    customStyleMap={styleMap}
                    onChange={handleEditorChange}
                    handleReturn={handleReturn}
                    keyBindingFn={handleKeyBinding}
                    handleKeyCommand={handleKeyCommand}
                />
            </div>
            {shouldShowInlineToolbar && !readOnly && (
                <InlineToolbar
                    editorState={editorState}
                    tools={tools}
                    references={references}
                    onChange={handleEditorChange}
                />
            )}
        </div>
    );
});

export default BaseTextEditor;
