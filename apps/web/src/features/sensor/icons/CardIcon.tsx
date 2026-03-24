import { SlotProps } from "@radix-ui/react-slot";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

interface CardIconProps extends SlotProps { }

export default function CardIcon({ className, ...props }: CardIconProps) {
  return (
    <Slot.Root className={cn("w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20", className)} {...props} />
  )
}