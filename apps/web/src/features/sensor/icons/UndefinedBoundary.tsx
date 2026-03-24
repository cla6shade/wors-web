import { ReactNode } from "react";

interface UndefinedBoundaryProps {
  value?: unknown;
  fallback?: ReactNode;
  children?: ReactNode;
}
export default function UndefinedBoundary({ value, fallback = <p className="p-4">N/A</p>, children }: UndefinedBoundaryProps) {
  if (typeof value === 'undefined') {
    return fallback;
  }
  return children;
}