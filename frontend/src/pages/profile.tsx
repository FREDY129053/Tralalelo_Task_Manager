import UserCard from "@/components/UserCard";
import { IUserFullInfo } from "@/interfaces/User";
import { useEffect, useState } from "react";
import { getProfile } from "./api/users";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Loading from "@/components/Loading";

export default function UserPage() {
  useAuthRedirect();
  const [user, setUser] = useState<IUserFullInfo | null>(null);

  useEffect(() => {
    getProfile().then(setUser).catch(console.error);
  }, []);

  return (
    <>
      {user ? (
        <UserCard user={user} />
      ) : (
        <div className="w-full h-full absolute translate-1/2">
                <Loading variant="dots" />
              </div>
      )}
    </>
  );
}
