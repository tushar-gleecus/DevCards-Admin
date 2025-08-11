'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { EditorOptions } from '@tiptap/core';
import {
  LinkBubbleMenu,
  MenuButton,
  RichTextEditor,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
  type RichTextEditorRef,
} from 'mui-tiptap';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';
import TextFields from '@mui/icons-material/TextFields';
import EditorMenuControls from './EditorMenuControls';
import useExtensions from './useExtensions';

function fileListToImageFiles(fileList: FileList): File[] {
  return Array.from(fileList).filter((file) => {
    const mimeType = (file.type || "").toLowerCase();
    return mimeType.startsWith("image/");
  });
}

type Props = {
  disableStickyMenuBar?: boolean;
  content: string;
  onContentChange?: (content: string) => void;
  editable?: boolean;
};

export default function Editor({ disableStickyMenuBar, content, onContentChange, editable = true }: Props) {
  
  const extensions = useExtensions({
    placeholder: "Add your own content here...",
  });
  const rteRef = useRef<RichTextEditorRef>(null);
  const [isEditable, setIsEditable] = useState(editable);
  const [showMenuBar, setShowMenuBar] = useState(true);

  useEffect(() => {
    if (rteRef.current?.editor) {
      setTimeout(() => {
        rteRef.current?.editor?.commands.setContent(content);
      }, 0);
    }
  }, [content]);

  const handleNewImageFiles = useCallback(
    (files: File[], insertPosition?: number): void => {
      if (!rteRef.current?.editor) {
        return;
      }

      const attributesForImageFiles = files.map((file) => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }));

      insertImages({
        images: attributesForImageFiles,
        editor: rteRef.current.editor,
        position: insertPosition,
      });
    },
    [],
  );

  const handleDrop: NonNullable<EditorOptions["editorProps"]["handleDrop"]> =
    useCallback(
      (view, event, _slice, _moved) => {
        if (!(event instanceof DragEvent) || !event.dataTransfer) {
          return false;
        }

        const imageFiles = fileListToImageFiles(event.dataTransfer.files);
        if (imageFiles.length > 0) {
          const insertPosition = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;

          handleNewImageFiles(imageFiles, insertPosition);

          event.preventDefault();
          return true;
        }

        return false;
      },
      [handleNewImageFiles],
    );

  const handlePaste: NonNullable<EditorOptions["editorProps"]["handlePaste"]> =
    useCallback(
      (_view, event, _slice) => {
        if (!event.clipboardData) {
          return false;
        }

        const pastedImageFiles = fileListToImageFiles(
          event.clipboardData.files,
        );
        if (pastedImageFiles.length > 0) {
          handleNewImageFiles(pastedImageFiles);
          return true;
        }

        return false;
      },
      [handleNewImageFiles],
    );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // ✅ prevents SSR hydration issues

  return (
    <>
      <RichTextEditor
        ref={rteRef}
        extensions={extensions}
        content={content}
        onUpdate={({ editor }) => {
          if (onContentChange) {
            onContentChange(editor.getHTML());
          }
        }}
        immediatelyRender={false}
        editable={isEditable}
        editorProps={{
          handleDrop: handleDrop,
          handlePaste: handlePaste,
        }}
        renderControls={() => <EditorMenuControls />}
        RichTextFieldProps={{
          variant: "outlined",
          MenuBarProps: {
            hide: !showMenuBar,
            disableSticky: disableStickyMenuBar,
          },
          footer: (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                borderTopStyle: "solid",
                borderTopWidth: 1,
                borderTopColor: (theme) => theme.palette.divider,
                py: 1,
                px: 1.5,
              }}
            >
              <MenuButton
                value="formatting"
                tooltipLabel={
                  showMenuBar ? "Hide formatting" : "Show formatting"
                }
                size="small"
                onClick={() => {
                  setShowMenuBar((currentState) => !currentState);
                }}
                selected={showMenuBar}
                IconComponent={TextFields}
              />

              <MenuButton
                value="formatting"
                tooltipLabel={
                  isEditable
                    ? "Prevent edits (use read-only mode)"
                    : "Allow edits"
                }
                size="small"
                onClick={() => {
                  setIsEditable((currentState) => !currentState);
                }}
                selected={!isEditable}
                IconComponent={isEditable ? Lock : LockOpen}
              />
            </Stack>
          ),
        }}
        sx={{
          "& .ProseMirror": {
            minHeight: "100px", // Approximately 5 lines of text
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              scrollMarginTop: showMenuBar ? 50 : 0,
            },
          },
        }}
      >
        {() => (
          <>
            <LinkBubbleMenu />
            <TableBubbleMenu />
          </>
        )}
      </RichTextEditor>
    </>
  );
}
