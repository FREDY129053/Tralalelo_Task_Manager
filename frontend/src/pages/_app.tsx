import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isShowSidebar = router.pathname === "/" ? false : true;
  return (
    <div className="bg-main-bg">
      {isShowSidebar ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 bg-main-bg h-full overflow-x-auto overflow-y-hidden">
            <Component {...pageProps} />
          </div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </div>
  );
}
