import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardContent } from "./cardContentTypes";

export function ViewCardContentDialog({
  open,
  onOpenChange,
  content,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: CardContent;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{content.name}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">{content.category_name}</div>
        <div className="my-2 font-semibold">{content.short_desc}</div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: content.rich_text }} />
      </DialogContent>
    </Dialog>
  );
}
