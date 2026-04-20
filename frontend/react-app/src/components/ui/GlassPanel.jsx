import React from 'react';

const GlassPanel = ({ children, className = '', active = false }) => {
  return (
    <div className={`glass-panel ${active ? 'glass-active' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default GlassPanel;
