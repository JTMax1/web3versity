import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

// Load and validate environment configuration
// This will fail fast with helpful error messages if config is invalid
import { env, devUtils } from "./config";

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// In development, log environment configuration
if (env.IS_DEVELOPMENT) {
  console.log('🚀 Web3Versity Starting...');
  console.log('📋 Environment Configuration:');
  devUtils.logEnvVars();

  // Validate environment
  const isValid = devUtils.validateEnv();
  if (!isValid) {
    console.error('❌ Environment validation failed. Please check your .env.local file.');
  }
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
