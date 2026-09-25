"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(18, 22, 35, 0.92)",
          border: "1px solid rgba(59, 70, 104, 0.8)",
          color: "#dfe4ef",
          backdropFilter: "blur(10px)",
        },
      }}
    />
  );
}
