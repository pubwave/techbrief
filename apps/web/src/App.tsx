import { Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { HomePageRoute } from "./routes/HomePageRoute";
import { SettingsPageRoute } from "./routes/SettingsPageRoute";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<HomePageRoute />} path="/" />
        <Route element={<HomePageRoute />} path="/article/:articleId" />
        <Route element={<SettingsPageRoute />} path="/settings" />
      </Route>
    </Routes>
  );
}
