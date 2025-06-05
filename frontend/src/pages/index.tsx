"use client";

import { useState } from "react";
import Image from "next/image";
import { FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";
import { loginUser, registerUser } from "./api/users";
import { useRouter } from "next/router";

export default function AuthPage() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSendingData, setIsSendingData] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    repeatPassword: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    setIsSendingData(true)
    e.preventDefault();
    console.table(formData)
    if (isRegistering) {
      registerUser(formData.username, formData.password, formData.email, formData.phone).then(() => router.push("/main")).catch(console.error)
    } else {
      loginUser(formData.username, formData.password).then(() => router.push("/main")).catch(console.error)
    }
    setIsSendingData(false)
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
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-xl text-[var(--color-text)]"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isRegistering ? "Регистрация" : "Вход в аккаунт"}
            </h2>
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-[var(--color-accent)]" />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                placeholder="Username"
                required
                className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-[var(--color-accent)]" />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                required
                className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>
            {isRegistering && (
              <>
                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-[var(--color-accent)]" />
                  <input
                    name="repeatPassword"
                    value={formData.repeatPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Repeat Password"
                    required
                    className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
                <div className="relative">
                  <FaEnvelope className="absolute top-3 left-3 text-[var(--color-accent)]" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email"
                    required
                    className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
                <div className="relative">
                  <FaPhone className="absolute top-3 left-3 text-[var(--color-accent)]" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="Phone (optional)"
                    className="pl-10 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={isSendingData}
              className="w-full py-2 px-4 bg-sky-500 text-white rounded-lg hover:bg-opacity-90 transition disabled:bg-sky-300 disabled:cursor-not-allowed"
            >
              {isRegistering ? "Зарегистрироваться" : "Войти"}
            </button>
            <p
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-center text-[var(--color-accent)] underline cursor-pointer mt-4"
            >
              {isRegistering
                ? "Уже есть аккаунт? Войти"
                : "Нет аккаунта? Зарегистрироваться"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
