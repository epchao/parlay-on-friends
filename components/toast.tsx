import React, { useEffect, useState } from "react";

type Props = { 
  children: React.ReactNode; 
  show: boolean; 
  onClose: () => void;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
};

export default function Toast({ children, show, onClose, type = 'success', duration = 3000 }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    } 
  }, [show, duration]);

  useEffect(() => {
    if (!show && shouldRender) {
      handleClose();
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300); // Match this with the transition duration
  };

  if (!shouldRender) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-700';
      case 'info': return 'bg-blue-700';
      case 'warning': return 'bg-yellow-700';
      case 'error': return 'bg-red-700';
      default: return 'bg-green-700';
    }
  };

  return (
    <div 
      className={`
        fixed bottom-8 right-8 ${getBackgroundColor()} text-white px-6 py-3 rounded-lg shadow-lg max-w-sm z-50
        transition-all duration-300 ease-in-out transform
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      style={{
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out, scale 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}
