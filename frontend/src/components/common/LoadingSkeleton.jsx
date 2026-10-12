import React from 'react';

export const LoadingSkeleton = ({ count = 3, height = 'h-16' }) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} bg-slate-200 dark:bg-slate-800/60 rounded-xl animate-pulse`}
        />
      ))}
    </div>
  );
};
