import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyCart({ isInvalid }: { isInvalid: boolean }) {
  const router = useRouter();
  return (
    <main className="container mx-auto px-4 max-w-md min-h-screen flex items-center justify-center">
      <Card className="w-full text-center">
        <CardContent className="pt-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {!isInvalid ? "Your cart is empty" : "Invalid Cart"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {!isInvalid
              ? "Add some stylish shoes to get started!"
              : "Your cart contains invalid items."}
          </p>
          <Button
            onClick={() => {
              localStorage.removeItem("cart");
              router.push("/");
            }}
            className="w-full"
          >
            {!isInvalid ? "Continue Shopping" : "Start Over"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}