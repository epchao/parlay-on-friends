import React, { useEffect } from "react";

type Props = { children: React.ReactNode; show: boolean; onClose: () => void };

export default function Toast({ children, show, onClose }: Props) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg">
      {children}
    </div>
  );
}
