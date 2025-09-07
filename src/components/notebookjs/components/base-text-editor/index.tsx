import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { CompositeDecorator, ContentState, convertToRaw, Editor, EditorState, getDefaultKeyBinding, Modifier, RichUtils, SelectionState } from "draft-js";
import "draft-js/dist/Draft.css";
import { KC_DELETE_BLOCK, KC_MOVE_BLOCK_UP, KC_MOVE_BLOCK_DOWN, KC_SHIFT_FOCUS_UP, KC_SHIFT_FOCUS_DOWN, KC_CUSTOM_SHORTCUT } from "../../data/const";
import { isCmdOS } from "../../utils/draft-helpers";
import InlineToolbar from "../inline-toolbar";
import { codeToKey } from "../../utils/keycode";
import { useNotebook } from "../../context";

type Props = {
  id: string;
  iText?: string;
  iInlineStyles?: any[];
  blockType: any;
  placeholder?: string;
  references?: { search: (q: string) => unknown; open: (ref: unknown) => unknown };
  readOnly?: boolean;
  shortcuts?: Array<{ shortcut: string; action: (args: any) => void }>;
  props?: any;
};

const BaseTextEditor = forwardRef<any, Props>(function BaseTextEditor({ id = "", iText = "", iInlineStyles = [], blockType = () => {}, placeholder = "Type something...", references = { search: () => {}, open: () => {} }, readOnly = false, shortcuts = [], props = {} }, ref) {
  const { tools, dispatcher } = useNotebook();
  const [editorState, setEditorState] = useState<EditorState>(() => {
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
        const selection = styleState.getSelection().merge({ anchorOffset: offset, focusOffset: offset + length, hasFocus: false }) as SelectionState;
        const stateWithSelection = EditorState.forceSelection(styleState, selection);
        const isEntityStyle = tools.some((tool: any) => tool.component && tool.styles?.some((s: any) => s.name === style));
        if (isEntityStyle) {
          const contentWithEntity = stateWithSelection.getCurrentContent().createEntity(style, "MUTABLE", data || {});
          const entityKey = contentWithEntity.getLastCreatedEntityKey();
          const withEntity = Modifier.applyEntity(contentWithEntity, selection, entityKey);
          styleState = EditorState.push(stateWithSelection, withEntity, "apply-entity");
        }
        styleState = EditorState.forceSelection(styleState, selection);
        styleState = RichUtils.toggleInlineStyle(styleState, style);
      });
      const selection = styleState.getSelection().merge({ anchorOffset: 0, focusOffset: 0, hasFocus: false }) as SelectionState;
      styleState = EditorState.forceSelection(styleState, selection);
      state = styleState;
    }
    return state;
  });

  const [hasSelection, setHasSelection] = useState(false);
  const editorRef = useRef<Editor>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSelection = () => {
      if (document.activeElement && editorWrapperRef.current?.contains(document.activeElement)) {
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) { setHasSelection(true); return; }
      }
      const selection = window.getSelection();
      if (!selection) { setHasSelection(false); return; }
      if (!selection.isCollapsed && selection.rangeCount > 0 && editorWrapperRef.current) {
        const range = selection.getRangeAt(0);
        const isSelectionInEditor = editorWrapperRef.current.contains(range.commonAncestorContainer as any);
        setHasSelection(isSelectionInEditor);
      } else { setHasSelection(false); }
    };
    document.addEventListener("selectionchange", checkSelection);
    checkSelection();
    return () => { document.removeEventListener("selectionchange", checkSelection); };
  }, [editorState]);

  const styleMap = useMemo(() => Object.fromEntries(tools.filter((tool: any) => Array.isArray(tool.styles)).map((tool: any) => tool.styles.map((style: any) => [style.name, style.styles])).reduce((ass: any[], style: any) => ass.concat(style), [])), [tools]);
  const styleConstants = useMemo(() => {
    const nonPersistentStyles = tools.map((tool: any) => tool.constants.some((c: string) => c === "NON-PERSISTENT") ? tool.styles.map((s: any) => s.name) : []).reduce((a: any[], s: any[]) => a.concat(s), []);
    const persistentStyles = tools.map((tool: any) => tool.constants.some((c: string) => c === "PERSISTENT") ? tool.styles.map((s: any) => s.name) : []).reduce((a: any[], s: any[]) => a.concat(s), []);
    return { NON_PERSISTENT_STYLES: nonPersistentStyles, PERSISTENT_STYLES: persistentStyles };
  }, [tools]);

  const evaluateShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.indexOf("+") ? shortcut.split("+").map((p) => p.toLowerCase()) : [shortcut.toLowerCase()];
    const useCmd = isCmdOS();
    return (e: KeyboardEvent) => {
      const partials = parts.map((part) => {
        if (part === "cmd") return useCmd ? (e as any).metaKey : (e as any).ctrlKey;
        else if (part === "ctrl") return (e as any).ctrlKey;
        else if (part === "shift") return (e as any).shiftKey;
        else if (part === "alt") return (e as any).altKey;
        else return part === codeToKey((e as any).code).toLowerCase();
      });
      if (!parts.includes("cmd") && (useCmd ? (e as any).metaKey : (e as any).ctrlKey)) return false;
      if (!parts.includes("ctrl") && (e as any).ctrlKey) return false;
      if (!parts.includes("shift") && (e as any).shiftKey) return false;
      if (!parts.includes("alt") && (e as any).altKey) return false;
      return partials.every((a) => a === true);
    };
  }, []);
  const shortcutEvaluators = useMemo(() => shortcuts.map((shortcut) => ({ shortcut: shortcut.shortcut, evaluator: evaluateShortcut(shortcut.shortcut), action: shortcut.action })), [shortcuts, evaluateShortcut]);
  const shortcutEvaluatorsLength = shortcutEvaluators.length;

  const hasPersistentStyle = styleConstants.PERSISTENT_STYLES.some((style: string) => editorState.getCurrentInlineStyle().has(style));
  const shouldShowInlineToolbar = hasSelection || (hasPersistentStyle && editorState.getSelection().isCollapsed() && editorState.getSelection().getHasFocus());

  const handleEditorChange = useCallback((state: EditorState) => {
    const selection = state.getSelection();
    setHasSelection(!selection.isCollapsed());
    if (selection.isCollapsed()) {
      const currentInlineStyle = state.getCurrentInlineStyle();
      const hasNonPersistentStyle = styleConstants.NON_PERSISTENT_STYLES.some((style: string) => currentInlineStyle.has(style));
      if (hasNonPersistentStyle) {
        styleConstants.NON_PERSISTENT_STYLES.forEach((style: string) => {
          if (currentInlineStyle.has(style)) state = RichUtils.toggleInlineStyle(state, style);
        });
      }
    }
    setEditorState(state);
    const contentState = state.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const text = contentState.getPlainText();
    if (rawContent.blocks && rawContent.blocks.length > 0) {
      const firstBlock = rawContent.blocks[0];
      const blockKey = firstBlock.key;
      const block = contentState.getBlockForKey(blockKey);
      const inlineStyles: any[] = [];
      const entityStyleNames = new Set(
        tools.filter((tool: any) => tool.component).flatMap((tool: any) => (tool.styles || []).map((style: any) => style.name)),
      );
      block.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (!entityKey) return false;
          const entity = contentState.getEntity(entityKey);
          return entityStyleNames.has(entity.getType());
        },
        (start, end) => {
          const entityKey = block.getEntityAt(start);
          const entity = contentState.getEntity(entityKey!);
          inlineStyles.push({ offset: start, length: end - start, style: entity.getType(), data: entity.getData() });
        },
      );
      const rawStyleRanges = firstBlock.inlineStyleRanges || [] as any[];
      rawStyleRanges.forEach(({ offset, length, style }: any) => {
        if (!entityStyleNames.has(style)) inlineStyles.push({ offset, length, style });
      });
      dispatcher({ type: "base-text-update", id, text, inlineStyles });
    }
  }, [id, dispatcher, styleConstants, tools]);

  const handleReturn = useCallback((e: any) => {
    const beforeObj = { type: "create-new-block", position: "before", id, blockType: blockType.followingBlock };
    const afterObj = { type: "create-new-block", position: "after", id, blockType: blockType.followingBlock };
    const useCmd = isCmdOS();
    if (useCmd) {
      if (e.metaKey && !e.shiftKey) { dispatcher(afterObj); return "handled"; }
      else if (e.metaKey && e.shiftKey) { dispatcher(beforeObj); return "handled"; }
    } else {
      if (e.ctrlKey && !e.shiftKey) { dispatcher(afterObj); return "handled"; }
      else if (e.ctrlKey && e.shiftKey) { dispatcher(beforeObj); return "handled"; }
    }
    return "not-handled";
  }, [id, dispatcher]);

  const handleKeyBinding = useCallback((e: any) => {
    const useCmd = isCmdOS();
    if (e.key === "Backspace" && (useCmd ? e.metaKey : e.ctrlKey) && e.shiftKey) { e.preventDefault(); return KC_DELETE_BLOCK; }
    if (e.key === "ArrowUp" && (useCmd ? e.metaKey : e.ctrl)) { e.preventDefault(); return KC_MOVE_BLOCK_UP; }
    if (e.key === "ArrowDown" && (useCmd ? e.metaKey : e.ctrl)) { e.preventDefault(); return KC_MOVE_BLOCK_DOWN; }
    if (e.key === "ArrowUp" && e.shiftKey) { e.preventDefault(); return KC_SHIFT_FOCUS_UP; }
    if (e.key === "ArrowDown" && e.shiftKey) { e.preventDefault(); return KC_SHIFT_FOCUS_DOWN; }
    for (let i = 0; i < shortcutEvaluatorsLength; i++) {
      if (shortcutEvaluators[i].evaluator(e) === true) {
        e.preventDefault();
        return KC_CUSTOM_SHORTCUT + ":" + shortcutEvaluators[i].shortcut;
      }
    }
    return getDefaultKeyBinding(e);
  }, [shortcutEvaluators, shortcutEvaluatorsLength]);

  const handleKeyCommand = useCallback((command: string) => {
    if (command === KC_DELETE_BLOCK) {
      window.getSelection()?.removeAllRanges();
      dispatcher({ type: "block-delete", id });
      return "handled";
    }
    if (command === KC_MOVE_BLOCK_UP) { dispatcher({ type: "block-move", id, dir: "up" }); return "handled"; }
    if (command === KC_MOVE_BLOCK_DOWN) { dispatcher({ type: "block-move", id, dir: "down" }); return "handled"; }
    if (command === KC_SHIFT_FOCUS_UP) { dispatcher({ type: "focus-move", id, dir: "up" }); return "handled"; }
    if (command === KC_SHIFT_FOCUS_DOWN) { dispatcher({ type: "focus-move", id, dir: "down" }); return "handled"; }
    if (command.startsWith(KC_CUSTOM_SHORTCUT + ":")) {
      const shortcut = command.split(":")[1];
      const shortcutDetails = shortcuts.find((sc) => sc.shortcut === shortcut);
      if (shortcutDetails && typeof shortcutDetails.action === "function") {
        shortcutDetails.action({ id, blockType, dispatcher });
      }
      return "handled";
    }
    return "not-handled";
  }, [id, dispatcher, shortcuts, blockType]);

  useImperativeHandle(ref, () => ({
    focusAtStart: () => {
      const selection = editorState.getSelection().merge({ anchorOffset: 0, focusOffset: 0, hasFocus: true }) as SelectionState;
      setEditorState((prev) => EditorState.forceSelection(prev, selection));
      editorRef.current?.focus();
    },
    focusAtEnd: () => {
      const content = editorState.getCurrentContent();
      const blockKey = content.getFirstBlock().getKey();
      const length = content.getBlockForKey(blockKey).getLength();
      const selection = editorState.getSelection().merge({ anchorOffset: length, focusOffset: length, hasFocus: true }) as SelectionState;
      setEditorState((prev) => EditorState.forceSelection(prev, selection));
      editorRef.current?.focus();
    },
    focusAt: (pos: number) => {
      const content = editorState.getCurrentContent();
      const blockKey = content.getFirstBlock().getKey();
      const length = content.getBlockForKey(blockKey).getLength();
      const offset = Math.max(0, Math.min(length, pos));
      const selection = editorState.getSelection().merge({ anchorOffset: offset, focusOffset: offset, hasFocus: true }) as SelectionState;
      setEditorState((prev) => EditorState.forceSelection(prev, selection));
      editorRef.current?.focus();
    },
    getCurrentPosition: () => {
      const selection = editorState.getSelection();
      return selection.getAnchorOffset();
    },
  }));

  return (
    <div className="relative">
      <div ref={editorWrapperRef} className="relative cursor-text">
        <Editor ref={editorRef as any} readOnly={readOnly} editorState={editorState} onChange={handleEditorChange} customStyleMap={styleMap} placeholder={placeholder} handleKeyCommand={handleKeyCommand as any} keyBindingFn={handleKeyBinding as any} handleReturn={handleReturn as any} />
      </div>
      {(hasSelection || (styleConstants.PERSISTENT_STYLES.some((s: string) => editorState.getCurrentInlineStyle().has(s)) && editorState.getSelection().isCollapsed() && editorState.getSelection().getHasFocus())) && !readOnly && (
        <InlineToolbar editorState={editorState} tools={tools} onChange={handleEditorChange} />
      )}
    </div>
  );
});

export default BaseTextEditor;
