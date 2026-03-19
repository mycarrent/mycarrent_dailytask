/**
 * App.tsx — Root component with routing, providers, and layout
 * Design: Orange & White — mobile-first with bottom navigation
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider, useData } from "./contexts/DataContext";
import BottomNav from "./components/BottomNav";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Vehicles from "./pages/Vehicles";
import Settings from "./pages/Settings";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452232695/Geqw5Dwwk2pA5LmRx3Tkji/my-car-rent-logo_efb7efea.webp";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/add" component={AddEntry} />
      <Route path="/history" component={History} />
      <Route path="/reports" component={Reports} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { loading } = useData();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header — white with orange accent */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-200">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO_URL}
              alt="My Car Rent"
              className="h-10 w-auto"
            />
          </div>
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
                className:
                  "brutal-card !border-2 !shadow-[3px_3px_0px_#F97316]",
              }}
            />
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
