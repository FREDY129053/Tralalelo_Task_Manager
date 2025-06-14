import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isShowSidebar = router.pathname === "/" ? false : true;
  return (
    <AnimatePresence mode="wait">
      <motion.div
      className="min-h-screen bg-main-bg"
        key={router.route}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
      >
        {isShowSidebar ? (
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 bg-main-bg h-full overflow-hidden">
            <Component {...pageProps} />
          </div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
      </motion.div>
    </AnimatePresence>
  );
}
