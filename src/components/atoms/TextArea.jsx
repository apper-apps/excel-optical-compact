import React from "react";
import { cn } from "@/utils/cn";

const TextArea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 resize-vertical",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";

export default TextArea;