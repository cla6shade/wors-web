import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { DirectionIcon } from "./direction-icon";
import { cn } from "./cn";

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
    <div className={cn("flex flex-col items-center justify-center pb-4", className)}>
      {value !== undefined ? <>{value}{unit}</> : "-"}
    </div>
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
  fallback,
  variant = 'wind',
  ...props
}: VectorProps) {
  return (
    <CardContent {...props}>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <DirectionIcon direction={direction} variant={variant} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" />
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

export const SensorCard = Object.assign(SensorCardRoot, {
  Header: SensorCardHeader,
  Scalar: SensorCardScalar,
  Vector: SensorCardVector,
});
