import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DirectionIcon from "../icons/DirectionIcon";
import UndefinedBoundary from "../icons/UndefinedBoundary";
import { cn } from "@/lib/utils";

/**
 * Composite component:
 * <SensorCard>
 *   <SensorCard.Header title="..." />
 *   <SensorCard.Scalar value={...} unit="..." />
 *   <SensorCard.Vector
 *      scale={...}
 *      unit="..."
 *      direction={...}
 *      caption="..."
 *   />
 * </SensorCard>
 */

type SensorCardRootProps = React.ComponentPropsWithoutRef<typeof Card>;

function SensorCardRoot({ className, ...props }: SensorCardRootProps) {
  return <Card {...props} className={cn("gap-4 shadow-2xl bg-white/70 border", className)} />;
}

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<typeof CardHeader>, "title">;

function SensorCardHeader({ title, children, ...props }: HeaderProps) {
  return (
    <CardHeader {...props}>
      <CardTitle className="text-lg sm:text-xl md:text-2xl">{title}</CardTitle>
      {children}
    </CardHeader>
  );
}

type ValueProps = {
  value?: number;
  unit: string;
  className?: string;
  fallback?: React.ReactNode;
};

function SensorCardValue({ value, unit, className, fallback }: ValueProps) {
  return (
    <UndefinedBoundary value={value} fallback={fallback}>
      <div className={cn("flex flex-col items-center justify-center pb-4", className)}>{value}
        {unit}
      </div>
    </UndefinedBoundary>
  );
}

type ScalarProps = {
  value?: number;
  unit: string;
  fallback?: React.ReactNode;
};

function SensorCardScalar({ value, unit, fallback }: ScalarProps) {
  return (
    <SensorCardValue
      value={value}
      unit={unit}
      className="text-xl sm:text-2xl font-bold grow"
      fallback={fallback}
    />
  );
}

type VectorProps = {
  scale?: number;
  unit: string;
  direction?: number;
  caption?: string;
  fallback?: React.ReactNode;
  variant?: 'wind' | 'wave' | 'current';
} & Omit<React.ComponentPropsWithoutRef<typeof CardContent>, "children">;

function SensorCardVector({
  scale,
  unit,
  direction,
  caption,
  fallback = <div className="text-xl sm:text-2xl font-bold">N/A</div>,
  variant = 'wind',
  ...props
}: VectorProps) {
  return (
    <CardContent {...props}>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <DirectionIcon scale={scale} direction={direction} variant={variant} />
        {caption ? <div className="text-base sm:text-lg md:text-xl">{caption}</div> : null}
        <SensorCardValue
          value={scale}
          unit={unit}
          className="text-xl sm:text-2xl font-bold"
          fallback={fallback}
        />
      </div>
    </CardContent>
  );
}

/**
 * Namespaced export (Composite Component)
 */
export const SensorCard = Object.assign(SensorCardRoot, {
  Header: SensorCardHeader,
  Scalar: SensorCardScalar,
  Vector: SensorCardVector,
});

export interface SensorCardProps {
  title: string;
  scale?: number;
  direction?: number;
  caption?: string;
  unit: string;
  dataType?: "scalar" | "vector";
}

export default function SensorCardCompat({
  title,
  scale,
  direction,
  caption,
  unit,
  dataType = "scalar",
}: SensorCardProps) {
  return (
    <SensorCard>
      <SensorCard.Header title={title}>
        {dataType === "scalar" ? <SensorCard.Scalar value={scale} unit={unit} /> : null}
      </SensorCard.Header>

      {dataType === "vector" ? (
        <SensorCard.Vector
          scale={scale}
          unit={unit}
          direction={direction}
          caption={caption}
        />
      ) : null}
    </SensorCard>
  );
}
