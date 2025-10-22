import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-papaya-pink text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="w-full p-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
           <svg className="w-8 h-8 text-papaya-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          <h1 className="text-2xl font-bold text-gray-800">
            Papaya <span className="text-papaya-pink">AI Designer</span>
          </h1>
        </div>
        <nav className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          <NavItem label="Generator" isActive={currentView === View.GENERATOR} onClick={() => setView(View.GENERATOR)} />
          <NavItem label="Editor" isActive={currentView === View.EDITOR} onClick={() => setView(View.EDITOR)} />
          <NavItem label="Support" isActive={currentView === View.SUPPORT} onClick={() => setView(View.SUPPORT)} />
        </nav>
      </div>
    </header>
  );
};

export default Header;