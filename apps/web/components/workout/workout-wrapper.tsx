"use client";

import { type ReactNode } from "react";
import { WorkoutProvider } from "./workout-provider";
import { WorkoutModal } from "./workout-modal";

interface WorkoutWrapperProps {
  children: ReactNode;
}

export function WorkoutWrapper({ children }: WorkoutWrapperProps) {
  return (
    <WorkoutProvider>
      {children}
      <WorkoutModal />
    </WorkoutProvider>
  );
}
