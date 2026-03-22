/**
 * App.tsx — Root component with routing, providers, and layout
 * Design: Clean Light Mode — orange & white, soft shadows
 *
 * Performance: All page components are loaded via React.lazy() so each route
 * is split into its own JS chunk. The browser only downloads the code for the
 * page the user is actually visiting, keeping the initial bundle small.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider, useData } from "./contexts/DataContext";
import BottomNav from "./components/BottomNav";
import LoadingScreen from "./components/LoadingScreen";

// ── Lazy-loaded page chunks ────────────────────────────────────────
// Each import() call becomes a separate JS chunk that is only fetched
// when the user navigates to that route for the first time.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddEntry  = lazy(() => import("./pages/AddEntry"));
const History   = lazy(() => import("./pages/History"));
const Reports   = lazy(() => import("./pages/Reports"));
const Vehicles  = lazy(() => import("./pages/Vehicles"));
const Settings  = lazy(() => import("./pages/Settings"));
const NotFound  = lazy(() => import("./pages/NotFound"));

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/my-car-rent-logo_efb7efea.webp";

// ── Fallback shown while a lazy chunk is being fetched ────────────
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
    </div>
  );
}

function Router() {
  return (
    // Suspense wraps the entire Switch so any lazy page can suspend here.
    // ErrorBoundary above will catch any chunk-load failures gracefully.
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/"          component={Dashboard} />
        <Route path="/add"       component={AddEntry} />
        <Route path="/history"   component={History} />
        <Route path="/reports"   component={Reports} />
        <Route path="/vehicles"  component={Vehicles} />
        <Route path="/settings"  component={Settings} />
        <Route path="/404"       component={NotFound} />
        <Route                   component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  const { loading } = useData();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header — clean with subtle shadow */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center">
          <img
            src={LOGO_URL}
            alt="My Car Rent"
            className="h-9 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        <Router />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <DataProvider>
            <AppContent />
            <Toaster
              position="top-center"
              toastOptions={{
                className: "!rounded-xl !shadow-md !border !border-orange-100",
              }}
            />
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
