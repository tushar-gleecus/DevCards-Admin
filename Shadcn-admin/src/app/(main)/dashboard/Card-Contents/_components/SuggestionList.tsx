import { Checkbox } from "@mui/material";
import type { MentionNodeAttrs } from "@tiptap/extension-mention";
import type { SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import type { MentionItem, MentionSuggestionOptions } from "./mentionSuggestionOptions";

export type SuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const SuggestionList = forwardRef<
  SuggestionListRef,
  SuggestionProps<MentionItem>
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];

    if (item) {
      command({
        id: item.id,
        label: item.label,
      } as MentionNodeAttrs);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + items.length - 1) % items.length,
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="items">
      {items.length ? (
        items.map((item, index) => (
          <button
            className={`item ${index === selectedIndex ? "is-selected" : ""}`}
            key={item.label}
            onClick={() => selectItem(index)}
          >
            {item.label || item.id}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});

SuggestionList.displayName = "SuggestionList";

export default SuggestionList;
