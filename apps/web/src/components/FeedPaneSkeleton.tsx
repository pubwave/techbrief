import { LoadingBlock } from "./LoadingBlock";

export function FeedPaneSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <LoadingBlock className="h-10 w-full" />
      <LoadingBlock className="h-36 w-full" />
      <LoadingBlock className="h-36 w-full" />
    </div>
  );
}
