
import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, className }) => {
  return (
    <div className={cn("stats-card animate-fade-in flex items-center", className)}>
      {icon && (
        <div className="mr-4 p-3 bg-primary-purple/10 rounded-lg">
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
