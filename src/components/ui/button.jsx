import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "bg-transparent text-foreground underline-offset-4 hover:underline": variant === "link",
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
          "h-8 rounded-md px-2 text-xs": size === "xs",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

// u0423u0441u0442u0430u043du0430u0432u043bu0438u0432u0430u0435u043c u0437u043du0430u0447u0435u043du0438u044f u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
Button.defaultProps = {
  variant: "primary",
  size: "default"
};

export { Button };
