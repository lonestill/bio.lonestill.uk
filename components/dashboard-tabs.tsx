"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  component: React.ReactNode;
}

interface DashboardTabsProps {
  tabs: Tab[];
}

export function DashboardTabs({ tabs }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-white/10 px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-mono text-sm transition-colors relative ${
                activeTab === tab.id
                  ? "text-purple-400"
                  : "text-neutral-400 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTabContent}
      </div>
    </div>
  );
}
