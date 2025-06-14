import { useEffect } from "react";
import { useRouter } from "next/router";
import { fullDecodeJWT } from "@/helpers/DecodeToken.";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("http://localhost:3000");
      return;
    }
    try {
      const payload = fullDecodeJWT(token);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) router.replace("http://localhost:3000");
      } else if (!payload?.uuid) {
        router.replace("http://localhost:3000");
      }
    } catch {
      router.replace("http://localhost:3000");
    }
  }, [router]);
}
