import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isShowSidebar = router.pathname === "/" ? false : true;
  return (
    <div>
      {isShowSidebar ? (
        <div className="flex gap-2 h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-y-auto bg-main-bg">
            <Component {...pageProps} />
          </div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </div>
  );
}
