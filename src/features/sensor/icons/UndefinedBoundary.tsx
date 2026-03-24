import { ReactNode } from "react";
import { CircleQuestionMark } from 'lucide-react';
import CardIcon from "./CardIcon";

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

export function CardIconFallback() {
  return (
    <CardIcon><CircleQuestionMark /></CardIcon>
  )
}