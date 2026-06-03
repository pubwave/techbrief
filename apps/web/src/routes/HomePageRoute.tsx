import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppRuntime } from "../app/app-runtime";
import { ChannelTabs } from "../components/ChannelTabs";
import { HomeDesktopView } from "../components/HomeDesktopView";
import { HomeMobileView } from "../components/HomeMobileView";
import { LoadingNotice } from "../components/LoadingNotice";
import { useFeedState } from "../hooks/useFeedState";
import { ui } from "../lib/ui";
import type { ChannelFilter } from "../types/feed";

export function HomePageRoute() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { isDesktop, locale, strings, theme } = useAppRuntime();
  const state = useFeedState(strings, locale, true);
  const selectedId = state.selectedId;
  const setSelectedId = state.setSelectedId;
  const isDetailRoute = !isDesktop && Boolean(articleId);

  useEffect(() => {
    if (articleId && articleId !== selectedId) {
      setSelectedId(articleId);
    }
  }, [articleId, selectedId, setSelectedId]);

  function handleChannelChange(channel: ChannelFilter) {
    state.setChannel(channel);
    if (isDetailRoute) {
      navigate("/");
    }
  }

  function handleOpenDetail(id: string) {
    state.setSelectedId(id);
    if (!isDesktop) {
      navigate(`/article/${encodeURIComponent(id)}`);
    }
  }

  const isInitialLoading = state.isLoading && state.items.length === 0 && !state.error;

  if (isDesktop) {
    return (
      <>
        {!isInitialLoading && state.error ? (
          <div className="absolute left-[76px] right-3 top-3 z-20 rounded-xl border border-tb-border bg-tb-surface-subtle px-3 py-2 text-[12px] text-tb-text-secondary">
            {state.error}
          </div>
        ) : null}
        <HomeDesktopView
          article={state.selectedArticle}
          channel={state.channel}
          hasMore={state.hasMore}
          isLoading={isInitialLoading}
          isLoadingMore={state.isLoadingMore}
          isTranslating={state.isTranslating}
          items={state.items}
          locale={locale}
          onChannelChange={handleChannelChange}
          onLoadMore={state.loadNextPage}
          onSearchChange={state.setSearch}
          onSelect={state.setSelectedId}
          search={state.search}
          selectedId={state.selectedId}
          strings={strings}
          theme={theme}
          newCount={state.newCount}
          newIds={state.newIds}
          onDismissNew={state.dismissNewCount}
          total={state.total}
          translationError={state.translationError}
        />
      </>
    );
  }

  return (
    <>
      <header className={`${ui.shell} mb-4 flex items-center gap-4 px-[18px] py-[14px]`}>
        <ChannelTabs onChange={handleChannelChange} strings={strings} value={state.channel} />
      </header>
      {!isInitialLoading && state.error ? (
        <div className={`${ui.subtlePanel} mb-3 px-3 py-2.5`}>{state.error}</div>
      ) : null}
      <HomeMobileView
        article={state.selectedArticle}
        hasMore={state.hasMore}
        isLoading={isInitialLoading}
        isLoadingMore={state.isLoadingMore}
        isTranslating={state.isTranslating}
        items={state.items}
        locale={locale}
        newCount={state.newCount}
        newIds={state.newIds}
        onDismissNew={state.dismissNewCount}
        onBackToList={() => navigate("/")}
        onLoadMore={state.loadNextPage}
        onOpenDetail={handleOpenDetail}
        onSearchChange={state.setSearch}
        screen={isDetailRoute ? "detail" : "list"}
        search={state.search}
        selectedId={state.selectedId}
        strings={strings}
        theme={theme}
        total={state.total}
        translationError={state.translationError}
      />
      {state.isLoading && !isInitialLoading ? <LoadingNotice strings={strings} /> : null}
    </>
  );
}
