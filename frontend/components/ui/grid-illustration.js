'use client';

export default function GridIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="float h-full w-[150%] origin-left"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 50%, transparent 0%, white 85%),
            linear-gradient(to right, rgba(0,0,0,0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.25) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 0%, transparent 8%),
            radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 30%)
          `,
          backgroundSize: '100% 100%, 64px 64px, 64px 64px, 64px 64px, 100% 100%, 100% 100%',
          maskImage: 'radial-gradient(circle at 25% 50%, transparent 0%, black 85%)'
        }}
      />
      <div 
        className="float absolute inset-0 [animation-delay:-10s]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 30%)
          `,
          backgroundSize: '100% 100%, 100% 100%',
          maskImage: 'radial-gradient(circle at 25% 50%, transparent 0%, black 85%)'
        }}
      />
    </div>
  );
}
