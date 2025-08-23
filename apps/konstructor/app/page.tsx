import { Button } from "@workspace/ui/components/button";
import { APP_TITLE } from "@/modules/app/consts/app";
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh bg-foreground">
      <div className="flex flex-col items-center justify-center gap-4 bg-foreground">
        <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  );
}
