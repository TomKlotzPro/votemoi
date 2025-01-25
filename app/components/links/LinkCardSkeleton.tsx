export default function LinkCardSkeleton() {
  return (
    <div className="bg-[#1e1e38]/80 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-purple-500/10 animate-pulse" />
        {/* Name and time */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 bg-purple-500/10 rounded animate-pulse" />
          <div className="h-1 w-1 rounded-full bg-purple-500/20" />
          <div className="h-4 w-16 bg-purple-500/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Title */}
        <div className="flex items-center space-x-2">
          <div className="h-5 w-3/4 bg-purple-500/10 rounded animate-pulse" />
        </div>
        {/* Description (2 lines) */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-purple-500/10 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-purple-500/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Image placeholder */}
      <div className="aspect-[2/1] w-full rounded-lg bg-purple-500/10 animate-pulse" />

      {/* Footer */}
      <div className="flex items-center space-x-4 pt-1">
        {/* Vote button */}
        <div className="h-8 w-20 bg-purple-500/10 rounded animate-pulse" />
        {/* Comment button */}
        <div className="h-8 w-20 bg-purple-500/10 rounded animate-pulse" />
      </div>
    </div>
  );
}
