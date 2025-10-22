import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 p-6 rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;