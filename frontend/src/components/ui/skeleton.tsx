import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function SessionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-16 h-5" />
                <Skeleton className="w-20 h-5" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>
            <Skeleton className="w-20 h-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-16 h-8" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="w-32 h-6 mb-4" />
        <SessionListSkeleton />
      </div>
    </div>
  );
}

