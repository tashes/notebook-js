import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useRef,
    useMemo,
} from "react";
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    ContentState,
    CompositeDecorator,
    Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

import InlineToolbar from "../inline-toolbar";
import { convertFromDraftToInlineStyles } from "../../utils/draft-helpers";
import { useCallback } from "react";

const BasicTextEditor = forwardRef(
    (
        {
            text = "",
            inlineStyles = [],
            onChange = () => {},
            onFocus = () => {},
            tools = [],
            readOnly = false,
            placeholder = "",
        },
        ref,
    ) => {
        const createFromTextAndInlineStyles = (iText, iInlineStyles) => {
            // Create a decorator for tools that need it TODO
            let toolDecorators = tools
                .filter((tool) => tool.component)
                .map((tool) => {
                    let styles = (tool.styles || []).map((style) => style.name);
                    let strategy =
                        typeof tool.strategy === "function"
                            ? tool.strategy
                            : (contentBlock, callback, contentState) => {
                                  contentBlock.findEntityRanges((character) => {
                                      const entityKey = character.getEntity();
                                      if (!entityKey) return false;
                                      const entity =
                                          contentState.getEntity(entityKey);
                                      return styles.includes(entity.getType());
                                  }, callback);
                              };
                    return {
                        strategy,
                        component: tool.component,
                    };
                });
            let decorator = new CompositeDecorator(toolDecorators);

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

                iInlineStyles.forEach((styleObj) => {
                    const { offset, length, style, data } = styleObj;

                    const selection = styleState.getSelection().merge({
                        anchorOffset: offset,
                        focusOffset: offset + length,
                        hasFocus: false,
                    });

                    const stateWithSelection = EditorState.forceSelection(
                        styleState,
                        selection,
                    );

                    // Check if this style is entity-backed (via tool.component)
                    const isEntityStyle = tools.some(
                        (tool) =>
                            tool.component &&
                            tool.styles?.some((s) => s.name === style),
                    );

                    if (isEntityStyle) {
                        // Create the entity first
                        const contentWithEntity = stateWithSelection
                            .getCurrentContent()
                            .createEntity(style, "MUTABLE", data || {});
                        const entityKey =
                            contentWithEntity.getLastCreatedEntityKey();

                        // Apply the entity to the selection
                        const withEntity = Modifier.applyEntity(
                            contentWithEntity,
                            selection,
                            entityKey,
                        );

                        styleState = EditorState.push(
                            stateWithSelection,
                            withEntity,
                            "apply-entity",
                        );
                    }

                    styleState = EditorState.forceSelection(
                        styleState,
                        selection,
                    );

                    // Regardless of entity, also apply inline style
                    styleState = RichUtils.toggleInlineStyle(styleState, style);
                });

                const selection = styleState.getSelection().merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: false,
                });

                styleState = EditorState.forceSelection(styleState, selection);
                state = styleState;
            }

            return state;
        };

        const [editorState, setEditorState] = useState(() => {
            return createFromTextAndInlineStyles(text, inlineStyles);
        });
        const [hasSelection, setHasSelection] = useState(false);
        const editorRef = useRef(null);
        const wrapperRef = useRef(null);

        // Track selection
        useEffect(() => {
            const checkSelection = () => {
                // 1st check if the editor has focus & selection
                if (
                    document.activeElement &&
                    wrapperRef.current?.contains(document.activeElement)
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
                    wrapperRef.current
                ) {
                    const range = selection.getRangeAt(0);
                    const isSelectionInEditor = wrapperRef.current.contains(
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

        // Check if should update self
        useEffect(() => {
            if (readOnly === true) {
                setEditorState(
                    createFromTextAndInlineStyles(text, inlineStyles),
                );
            }
        }, [readOnly, text, inlineStyles]);

        // Auto-generate style map from tools
        const styleMap = useMemo(() => {
            return Object.fromEntries(
                tools
                    .filter((tool) => tool.styles)
                    .flatMap((tool) =>
                        tool.styles.map((style) => [style.name, style.styles]),
                    ),
            );
        }, [tools]);

        const styleConstants = useMemo(() => {
            let nonPersistentStyles = tools
                .map((tool) =>
                    tool.constants.some(
                        (constant) => constant === "NON-PERSISTENT",
                    )
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

        // Toolbar should show if selection exists
        const hasPersistentStyle = styleConstants.PERSISTENT_STYLES.some(
            (style) => editorState.getCurrentInlineStyle().has(style),
        );
        const shouldShowInlineToolbar =
            hasSelection ||
            (hasPersistentStyle &&
                editorState.getSelection().isCollapsed() &&
                editorState.getSelection().getHasFocus());

        // Expose toggle via ref
        useImperativeHandle(ref, () => ({
            toggleStyle: (style) => {
                setEditorState((prevState) =>
                    RichUtils.toggleInlineStyle(prevState, style),
                );
            },
        }));

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
                        styleConstants.NON_PERSISTENT_STYLES.forEach(
                            (style) => {
                                if (currentInlineStyle.has(style)) {
                                    state = RichUtils.toggleInlineStyle(
                                        state,
                                        style,
                                    );
                                }
                            },
                        );
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
                    onChange({ text, inlineStyles });
                }
            },
            [onChange],
        );

        return (
            <div className="relative">
                <div ref={wrapperRef} className="relative cursor-text">
                    <Editor
                        ref={editorRef}
                        readOnly={readOnly}
                        editorState={editorState}
                        onFocus={onFocus}
                        onChange={handleEditorChange}
                        customStyleMap={styleMap}
                        placeholder={placeholder}
                    />
                </div>
                {shouldShowInlineToolbar && !readOnly && (
                    <InlineToolbar
                        editorState={editorState}
                        tools={tools}
                        onChange={handleEditorChange}
                    />
                )}
            </div>
        );
    },
);

export default BasicTextEditor;
