import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "./api/users";
import Form, { FormValues } from "@/components/Form";

export default function AuthPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayedRegistering, setDisplayedRegistering] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false);

  const handleFormSubmit = async (data: FormValues) => {
    setIsSendingData(true);
    try {
      if (displayedRegistering) {
        const res = await registerUser(
          data.username,
          data.password,
          data.email!
        );
        localStorage.setItem("token", res.message)
      } else {
        const res = await loginUser(data.username, data.password);
        localStorage.setItem("token", res.message)
      }
      router.push("/main");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSendingData(false);
    }
  };

  const handleToggleRegister = () => {
    setIsRegistering((prev) => !prev);
    setTimeout(() => {
      setDisplayedRegistering((prev) => !prev);
    }, 200);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-primary">
      <div
        className="absolute top-0 h-full w-1/3 md:w-1/3 sm:w-full z-20 transition-transform duration-800 ease-in-out transform"
        style={{
          transform: isRegistering ? "translateX(200%)" : "translateX(0%)",
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/eblan.jpg"
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
            isRegistering={displayedRegistering}
            isSendingData={isSendingData}
            toggleRegister={handleToggleRegister}
            onSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </div>
  );
}
