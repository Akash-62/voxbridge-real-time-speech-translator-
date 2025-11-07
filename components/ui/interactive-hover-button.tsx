import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "group relative w-full overflow-hidden rounded-full border-2 p-3 text-center font-semibold",
        "bg-[#202C33] border-[#005C4B] text-[#E9EDEF]",
        disabled && "cursor-not-allowed opacity-50",
        !disabled && "cursor-pointer",
        className,
      )}
      {...props}
    >
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0 disabled:group-hover:translate-x-1 disabled:group-hover:opacity-100">
        {text}
      </span>
      {!disabled && (
        <>
          <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-[#E9EDEF] opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
            <span>{text}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-[#00A884] transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-[#005C4B]"></div>
        </>
      )}
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };

