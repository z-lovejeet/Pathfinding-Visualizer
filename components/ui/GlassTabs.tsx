'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface GlassTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`glass-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className="glass-tab"
          data-active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
