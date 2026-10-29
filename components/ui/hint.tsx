import React from "react";

export interface HintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function Hint({ id, children, className = "", ...props }: HintProps) {
  return (
    <p
      id={id}
      className={`text-xs text-steel-500 [data-tone=dark]_&:text-steel-400 mt-1.5 leading-normal ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}
