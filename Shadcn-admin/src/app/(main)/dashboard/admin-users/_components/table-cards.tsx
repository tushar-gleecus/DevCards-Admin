import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TableCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((_, idx) => (
        <Card key={idx} className="shadow-sm">
          <CardHeader>
            <CardTitle>Card {idx + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">Placeholder content</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
