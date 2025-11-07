import React, { useEffect, useRef } from 'react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#DC3545] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-[#202C33] rounded-xl shadow-2xl p-6 m-4 max-w-md w-full text-center border border-[#DC3545]/30"
        onClick={e => e.stopPropagation()}
      >
        <ErrorIcon />
        <h3 className="text-xl font-semibold text-[#E9EDEF] mb-3">Error</h3>
        <p className="text-[#8696A0] mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-[#005C4B] to-[#00A884] hover:from-[#006B5A] hover:to-[#00B894] text-white font-semibold py-2.5 px-8 rounded-lg shadow-lg hover:shadow-xl"
          aria-label="Close error modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};