import UserCard from "@/components/UserCard";
import { IUserFullInfo } from "@/interfaces/User";
import { useEffect, useState } from "react";
import { getProfile } from "./api/users";

export default function UserPage() {
  const [user, setUser] = useState<IUserFullInfo | null>(null);

  useEffect(() => {
    getProfile().then(setUser).catch(console.error);
  }, []);

  return <>{user ? <UserCard user={user} /> : <div>Loading...</div>}</>;
}
