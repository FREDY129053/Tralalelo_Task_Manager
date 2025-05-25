// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';

// export default function Index() {
//   const [isRegister, setIsRegister] = useState(false);

//   const handleToggle = () => setIsRegister((prev) => !prev);
//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     console.log(isRegister ? 'Register:' : 'Login:', Object.fromEntries(formData.entries()));
//   };

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
//       <section className="relative w-full max-w-7xl h-[650px] md:h-[700px] flex overflow-hidden rounded-3xl shadow-xl">
//         {/* Image block */}
//         <div
//           className={`relative w-full md:w-1/3 transition-transform duration-700 ease-in-out ${
//             isRegister ? 'md:translate-x-full md:order-2' : 'md:translate-x-0 md:order-1'
//           }`}
//         >
//           <Image
//             src="https://avatars.mds.yandex.net/i?id=ba15c7a410cb6045fae33e4bdbcb6a503abebf16-5110698-images-thumbs&n=13"
//             alt="Illustration"
//             fill
//             className="object-cover"
//             priority
//           />
//         </div>

//         {/* Form block */}
//         <div
//           className={`flex flex-col justify-center items-center w-full md:w-2/3 px-8 sm:px-12 md:px-16 bg-[var(--color-bg-elevated)] transition-transform duration-700 ease-in-out ${
//             isRegister ? 'md:-translate-x-1/3 md:order-1' : 'md:translate-x-0 md:order-2'
//           }`}
//         >
//           <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[var(--color-text-primary)] text-center">
//             {isRegister ? 'Регистрация' : 'Вход'} Tralalelo Tasklala
//           </h2>

//           <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
//             {/* Username */}
//             <div className="relative">
//               <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Имя пользователя"
//                 required
//                 className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] placeholder-[var(--color-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
//               />
//             </div>

//             {/* Password */}
//             <div className="relative">
//               <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Пароль"
//                 required
//                 className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] placeholder-[var(--color-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
//               />
//             </div>

//             {isRegister && (
//               <>
//                 {/* Repeat password */}
//                 <div className="relative">
//                   <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
//                   <input
//                     type="password"
//                     name="repeat_password"
//                     placeholder="Повторите пароль"
//                     required
//                     className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] placeholder-[var(--color-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
//                   />
//                 </div>

//                 {/* Email */}
//                 <div className="relative">
//                   <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Почта"
//                     required
//                     className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] placeholder-[var(--color-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
//                   />
//                 </div>

//                 {/* Phone (optional) */}
//                 <div className="relative">
//                   <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
//                   <input
//                     type="tel"
//                     name="phone"
//                     placeholder="Телефон (опционально)"
//                     className="w-full pl-12 pr-4 py-2 rounded-lg border border-[var(--color-input-border)] bg-[var(--color-input-bg)] placeholder-[var(--color-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
//                   />
//                 </div>
//               </>
//             )}

//             <button
//               type="submit"
//               className="w-full py-2 rounded-lg bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] hover:bg-[var(--color-button-primary-hover)] transition-colors"
//             >
//               {isRegister ? 'Зарегистрироваться' : 'Войти'}
//             </button>
//           </form>

//           <p className="mt-6 text-sm text-[var(--color-text-secondary)] text-center">
//             {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
//             <button
//               onClick={handleToggle}
//               className="underline text-[var(--color-button-primary-hover)] hover:opacity-80"
//             >
//               {isRegister ? 'Войти' : 'Регистрация'}
//             </button>
//           </p>
//         </div>
//       </section>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import { FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
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
    e.preventDefault();
    console.log(isRegistering ? "Registering" : "Logging in", formData);
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
              className="w-full py-2 px-4 bg-[var(--color-accent)] text-white rounded-lg hover:bg-opacity-90 transition"
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
