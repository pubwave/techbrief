import { ui } from "../lib/ui";
import { LoadingBlock } from "./LoadingBlock";

export function AppLoadingShell() {
  return (
    <main className="mx-auto my-11 w-[calc(100vw-48px)] max-md:my-3 max-md:w-[calc(100vw-24px)]">
      <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 max-md:grid-cols-1">
        <aside className={`${ui.shell} flex flex-col gap-3 px-3 py-4`}>
          <LoadingBlock className="h-7 w-24" />
          <div className="border-t border-tb-border" />
          <LoadingBlock className="h-11 w-full" />
          <LoadingBlock className="h-11 w-full" />
        </aside>
        <div className="min-w-0">
          <header className={`${ui.shell} mb-4 flex items-center gap-4 px-[18px] py-[14px]`}>
            <LoadingBlock className="h-10 w-72" />
          </header>
          <div className="grid items-start grid-cols-[380px_minmax(0,1fr)] gap-4 max-md:grid-cols-1">
            <section className={`${ui.shell} flex flex-col gap-3 p-[14px]`}>
              <LoadingBlock className="h-10 w-full" />
              <LoadingBlock className="h-36 w-full" />
              <LoadingBlock className="h-36 w-full" />
            </section>
            <section className={`${ui.shell} flex flex-col gap-4 p-[18px]`}>
              <LoadingBlock className="h-4 w-24" />
              <LoadingBlock className="h-14 w-5/6" />
              <LoadingBlock className="h-4 w-full" />
              <LoadingBlock className="h-4 w-11/12" />
              <LoadingBlock className="h-4 w-10/12" />
              <LoadingBlock className="h-10 w-32" />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
