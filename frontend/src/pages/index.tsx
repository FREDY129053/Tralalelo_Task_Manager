import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "./api/users";
import Form, { FormValues } from "@/components/Form";

export default function AuthPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);

  const handleFormSubmit = async (data: FormValues) => {
    setIsSendingData(true);

    try {
      if (isRegistering) {
        await registerUser(data.username, data.password, data.email!, data.phone || "");
      } else {
        await loginUser(data.username, data.password);
      }
      router.push("/main");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSendingData(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[var(--color-bg)]">
      <div
        className="absolute top-0 h-full w-1/3 md:w-1/3 sm:w-full z-20 transition-transform duration-700 ease-in-out transform"
        style={{
          transform: isRegistering ? "translateX(200%)" : "translateX(0%)",
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="https://avatars.mds.yandex.net/i?id=ba15c7a410cb6045fae33e4bdbcb6a503abebf16-5110698-images-thumbs&n=13"
            alt="Side Illustration"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex w-full h-full items-center justify-center">
        <div
          className={`w-full md:w-2/3 h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
            isRegistering ? "pl-0 pr-[33.33%]" : "pl-[33.33%] pr-0"
          }`}
        >
          <Form
            isRegistering={isRegistering}
            isSendingData={isSendingData}
            toggleRegister={() => setIsRegistering(!isRegistering)}
            onSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </div>
  );
}
