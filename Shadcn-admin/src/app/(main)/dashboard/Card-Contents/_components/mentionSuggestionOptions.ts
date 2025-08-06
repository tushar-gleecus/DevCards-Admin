import { Mention } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SuggestionList, { SuggestionListRef } from "./SuggestionList";
import { Editor, Range } from '@tiptap/core';

// This is a basic example of a mention suggestion extension. You can find more
// advanced examples with asynchronous requests and custom queries in the Tiptap
// documentation: https://tiptap.dev/api/nodes/mention#usage

export interface MentionItem {
  id: string;
  label: string;
}

const DUMMY_MENTIONS: MentionItem[] = [
  { id: "1", label: "Axl Rose" },
  { id: "2", label: "Slash" },
  { id: "3", label: "Duff McKagan" },
  { id: "4", label: "Izzy Stradlin" },
  { id: "5", label: "Steven Adler" },
  { id: "6", label: "Matt Sorum" },
  { id: "7", label: "Gilby Clarke" },
  { id: "8", label: "Frank Ferrer" },
  { id: "9", label: "Richard Fortus" },
  { id: "10", label: "Melissa Reese" },
];

export interface SuggestionProps {
  editor: Editor;
  clientRect?: any;
  range: Range;
}

export interface MentionSuggestionOptions {
  items: ({ query }: { query: string }) => MentionItem[];
  render: () => {
    onStart: (props: SuggestionProps) => void;
    onUpdate: (props: SuggestionProps) => void;
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };
}

export const mentionSuggestionOptions = {
  items: ({ query }: { query: string }) => {
    if (!query) {
      return DUMMY_MENTIONS;
    }

    return DUMMY_MENTIONS.filter((item) =>
      item.label.toLowerCase().startsWith(query.toLowerCase()),
    ).slice(0, 5);
  },
  render: () => {
    let reactRenderer: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: SuggestionProps) => {
        reactRenderer = new ReactRenderer(SuggestionList, {
          props,
          editor: props.editor,
        });

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect || (() => new DOMRect()),
          appendTo: () => document.body,
          content: reactRenderer.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate: (props: SuggestionProps) => {
        reactRenderer.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect || (() => new DOMRect()),
        });
      },
      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === "Escape") {
          popup[0].hide();

          return true;
        }

        return (reactRenderer.ref as SuggestionListRef)?.onKeyDown(props);
      },
      onExit: () => {
        popup[0].destroy();
        reactRenderer.destroy();
      },
    };
  },
};
