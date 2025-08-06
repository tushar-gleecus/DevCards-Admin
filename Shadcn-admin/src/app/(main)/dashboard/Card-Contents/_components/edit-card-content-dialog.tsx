import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardContent } from "./cardContentTypes";

const Editor = dynamic(() => import("./Editor"), { ssr: false });

export function EditCardContentDialog({
  open,
  onOpenChange,
  content,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: CardContent;
  onSave: (id: number, data: CardContent) => void;
}) {
  const [name, setName] = useState(content.name);
  const [shortDesc, setShortDesc] = useState(content.short_desc);
  const [category, setCategory] = useState(content.category_name);
  const [html, setHtml] = useState(content.rich_text);

  useEffect(() => {
    setName(content.name);
    setShortDesc(content.short_desc);
    setCategory(content.category_name);
    setHtml(content.rich_text);
  }, [content]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Card Content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Editor content={html} onContentChange={setHtml} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              onSave(content.id, {
                ...content,
                name,
                short_desc: shortDesc,
                category_name: category,
                rich_text: html,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
