import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex gap-2 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
