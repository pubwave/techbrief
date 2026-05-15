interface LoadingBlockProps {
  className?: string;
}

export function LoadingBlock({ className = "" }: LoadingBlockProps) {
  return <div className={`tb-loading-shimmer rounded-xl ${className}`.trim()} />;
}
