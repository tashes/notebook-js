import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useMemo, useCallback } from "react";
import { Editor, EditorState, RichUtils, convertToRaw, ContentState, CompositeDecorator, Modifier } from "draft-js";
import "draft-js/dist/Draft.css";
import InlineToolbar from "../inline-toolbar";
import { convertFromDraftToInlineStyles } from "../../utils/draft-helpers";

type Props = {
  text?: string;
  inlineStyles?: any[];
  onChange?: (data: { text: string; inlineStyles: any[] }) => void;
  onFocus?: () => void;
  tools?: any[];
  readOnly?: boolean;
  placeholder?: string;
};

const BasicTextEditor = forwardRef<any, Props>(({ text = "", inlineStyles = [], onChange = () => {}, onFocus = () => {}, tools = [], readOnly = false, placeholder = "" }, ref) => {
  const createFromTextAndInlineStyles = (iText: string, iInlineStyles: any[]) => {
    const toolDecorators = tools.filter((tool: any) => tool.component).map((tool: any) => {
      const styles = (tool.styles || []).map((style: any) => style.name);
      const strategy = typeof tool.strategy === "function" ? tool.strategy : (contentBlock: any, callback: any, contentState: any) => {
        contentBlock.findEntityRanges((character: any) => {
          const entityKey = character.getEntity();
          if (!entityKey) return false;
          const entity = contentState.getEntity(entityKey);
          return styles.includes(entity.getType());
        }, callback);
      };
      return { strategy, component: tool.component };
    });
    const decorator = new CompositeDecorator(toolDecorators);
    let contentState: ContentState;
    try { contentState = ContentState.createFromText(iText || ""); } catch { contentState = ContentState.createFromText(""); }
    let state = EditorState.createWithContent(contentState, decorator);
    if (iInlineStyles && iInlineStyles.length > 0) {
      let styleState = state;
      iInlineStyles.forEach((styleObj: any) => {
        const { offset, length, style, data } = styleObj;
        const selection = styleState.getSelection().merge({ anchorOffset: offset, focusOffset: offset + length, hasFocus: false });
        const stateWithSelection = EditorState.forceSelection(styleState, selection as any);
        const isEntityStyle = tools.some((tool: any) => tool.component && tool.styles?.some((s: any) => s.name === style));
        if (isEntityStyle) {
          const contentWithEntity = stateWithSelection.getCurrentContent().createEntity(style, "MUTABLE", data || {});
          const entityKey = contentWithEntity.getLastCreatedEntityKey();
          const withEntity = Modifier.applyEntity(contentWithEntity, selection as any, entityKey);
          styleState = EditorState.push(stateWithSelection, withEntity, "apply-entity");
        }
        styleState = EditorState.forceSelection(styleState, selection as any);
        styleState = RichUtils.toggleInlineStyle(styleState, style);
      });
      const selection = (styleState.getSelection().merge({ anchorOffset: 0, focusOffset: 0, hasFocus: false }) as any);
      styleState = EditorState.forceSelection(styleState, selection);
      state = styleState;
    }
    return state;
  };

  const [editorState, setEditorState] = useState(() => createFromTextAndInlineStyles(text, inlineStyles));
  const [hasSelection, setHasSelection] = useState(false);
  const editorRef = useRef<Editor>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSelection = () => {
      if (document.activeElement && wrapperRef.current?.contains(document.activeElement)) {
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) { setHasSelection(true); return; }
      }
      const selection = window.getSelection();
      if (!selection) { setHasSelection(false); return; }
      if (!selection.isCollapsed && selection.rangeCount > 0 && wrapperRef.current) {
        const range = selection.getRangeAt(0);
        const isSelectionInEditor = wrapperRef.current.contains(range.commonAncestorContainer as any);
        setHasSelection(isSelectionInEditor);
      } else setHasSelection(false);
    };
    document.addEventListener("selectionchange", checkSelection);
    checkSelection();
    return () => { document.removeEventListener("selectionchange", checkSelection); };
  }, [editorState]);

  useEffect(() => {
    if (readOnly === true) setEditorState(createFromTextAndInlineStyles(text, inlineStyles));
  }, [readOnly, text, inlineStyles]);

  const styleMap = useMemo(() => Object.fromEntries(tools.filter((tool: any) => tool.styles).flatMap((tool: any) => tool.styles.map((style: any) => [style.name, style.styles]))), [tools]);
  const styleConstants = useMemo(() => {
    const nonPersistentStyles = tools.map((tool: any) => tool.constants.some((c: string) => c === "NON-PERSISTENT") ? tool.styles.map((style: any) => style.name) : []).reduce((ass: any[], styles: any[]) => ass.concat(styles), []);
    const persistentStyles = tools.map((tool: any) => tool.constants.some((c: string) => c === "PERSISTENT") ? tool.styles.map((style: any) => style.name) : []).reduce((ass: any[], styles: any[]) => ass.concat(styles), []);
    return { NON_PERSISTENT_STYLES: nonPersistentStyles, PERSISTENT_STYLES: persistentStyles };
  }, [tools]);

  const hasPersistentStyle = styleConstants.PERSISTENT_STYLES.some((style: string) => editorState.getCurrentInlineStyle().has(style));
  const shouldShowInlineToolbar = hasSelection || (hasPersistentStyle && editorState.getSelection().isCollapsed() && editorState.getSelection().getHasFocus());

  useImperativeHandle(ref, () => ({
    toggleStyle: (style: string) => setEditorState((prevState) => RichUtils.toggleInlineStyle(prevState, style)),
  }));

  const handleEditorChange = useCallback((state: EditorState) => {
    const selection = state.getSelection();
    setHasSelection(!selection.isCollapsed());
    if (selection.isCollapsed()) {
      const currentInlineStyle = state.getCurrentInlineStyle();
      const hasNonPersistentStyle = styleConstants.NON_PERSISTENT_STYLES.some((style: string) => currentInlineStyle.has(style));
      if (hasNonPersistentStyle) {
        styleConstants.NON_PERSISTENT_STYLES.forEach((style: string) => { if (currentInlineStyle.has(style)) state = RichUtils.toggleInlineStyle(state, style); });
      }
    }
    setEditorState(state);
    const contentState = state.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const text = contentState.getPlainText();
    if (rawContent.blocks && rawContent.blocks.length > 0) {
      const firstBlock = rawContent.blocks[0];
      const rawInlineStyles = firstBlock.inlineStyleRanges || [];
      const inlineStyles = convertFromDraftToInlineStyles(rawInlineStyles as any);
      onChange({ text, inlineStyles });
    }
  }, [onChange, styleConstants]);

  return (
    <div className="relative">
      <div ref={wrapperRef} className="relative cursor-text">
        <Editor ref={editorRef as any} readOnly={readOnly} editorState={editorState} onFocus={onFocus} onChange={handleEditorChange} customStyleMap={styleMap} placeholder={placeholder} />
      </div>
      {shouldShowInlineToolbar && !readOnly && (
        <InlineToolbar editorState={editorState} tools={tools} onChange={handleEditorChange} />
      )}
    </div>
  );
});

export default BasicTextEditor;

