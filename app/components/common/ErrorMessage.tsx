interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className,
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-red-500/30 bg-red-500/5 p-4 backdrop-blur-sm ${className || ''}`}
    >
      <div className="relative z-10 text-red-400">{message}</div>
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse" />
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-transparent blur opacity-30" />
    </div>
  );
}
