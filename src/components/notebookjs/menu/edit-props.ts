export default {
  name: "Edit Properties",
  shortcut: "Cmd+Shift+P",
  action: (_: any, { openEditor }: { openEditor: (name: string, data: any) => void }) => {
    openEditor("properties", {});
  },
};

