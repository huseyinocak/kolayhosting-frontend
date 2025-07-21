import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn, buttonVariants } from "@/lib/utils" // buttonVariants'ı utils'den import ediyoruz

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"; // asChild prop'una göre hangi bileşenin render edileceğini belirliyoruz
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button"

export { Button } // Sadece Button bileşenini dışa aktarıyoruz