import React, { useRef, useState } from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<any> | void;
  spinnerClassName?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  spinnerClassName = "ml-2 h-4 w-4 animate-spin",
  disabled,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setLoading(true);
    timerRef.current = setTimeout(() => setShowSpinner(true), 300);
    try {
      await onClick?.(e);
    } finally {
      setLoading(false);
      setShowSpinner(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading || disabled} {...props}>
      {children}
      {showSpinner && <Loader2 className={spinnerClassName} />}
    </Button>
  );
};
