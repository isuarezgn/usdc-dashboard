'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart3, History, Send, Home } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'history', label: 'Transaction History', icon: History },
  { id: 'transfer', label: 'Send USDC', icon: Send },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex-1 sm:flex-none justify-center sm:justify-start transition-all',
              activeTab === item.id 
                ? 'shadow-sm' 
                : 'hover:bg-background/80'
            )}
          >
            <Icon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}