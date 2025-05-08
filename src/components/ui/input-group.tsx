
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex w-full rounded-md border border-input", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";

export { InputGroup };
