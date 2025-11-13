import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-white/60 flex items-center justify-between">
        <p className="font-display text-white">ZEDOVA</p>
        <p>© {new Date().getFullYear()} Sustainable Clothing Exchange</p>
      </div>
    </footer>
  );
}

