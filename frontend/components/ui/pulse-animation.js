'use client';

export default function PulseAnimation({ className = '', delay = 0 }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="absolute inset-0">
        <div className="pulse pulse-1 absolute inset-0 rounded-full bg-purple-400/20" />
        <div className="pulse pulse-2 absolute inset-0 rounded-full bg-purple-400/20" />
        <div className="pulse pulse-3 absolute inset-0 rounded-full bg-purple-400/20" />
      </div>
    </div>
  );
}
