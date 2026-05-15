import { Outlet, useLocation, useNavigate } from "react-router";
import { useAppRuntime } from "../app/AppRuntimeContext";
import { SideNav, type AppView } from "./SideNav";

export function AppLayout() {
  const { isDesktop, strings } = useAppRuntime();
  const location = useLocation();
  const navigate = useNavigate();
  const view: AppView = location.pathname === "/settings" ? "settings" : "home";

  function handleViewChange(nextView: AppView) {
    navigate(nextView === "settings" ? "/settings" : "/");
  }

  if (!isDesktop) {
    return (
      <main className="mx-auto my-3 w-[calc(100vw-24px)]">
        <div className="flex flex-col gap-4">
          <SideNav onChange={handleViewChange} strings={strings} value={view} />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-tb-surface-app">
      <SideNav onChange={handleViewChange} strings={strings} value={view} />
      <div className="flex min-w-0 flex-1">
        <Outlet />
      </div>
    </main>
  );
}
