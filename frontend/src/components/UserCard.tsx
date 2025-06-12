import Image from "next/image";
import { useState } from "react";
import { IUserFullInfo } from "@/interfaces/User";
import returnDate from "@/helpers/NormalDate";

type Props = {
  user: IUserFullInfo;
};

export default function UserCard({ user }: Props) {
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user.phone || "");

  const [userData, setUserData] = useState(user);

  const handlePhoneSave = () => {
    setUserData({ ...userData, phone: phoneValue });
    setEditingPhone(false);
    // Здесь можно вызвать API для обновления телефона
    console.log("Изменено: phone", phoneValue);
  };

  // Для отображения пароля точками
  const passwordDots = "•".repeat(8);

  // Формат даты регистрации
  const regDate = returnDate(user.registered_at)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-base)] p-4">
      {user ? (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-xl p-8 max-w-lg w-full flex flex-col items-center transition">
          {/* Аватар */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-accent)] shadow-lg mb-6 group relative">
              <Image
                src={userData.avatar_url}
                alt={userData.username}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Имя пользователя */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
            {userData.username}
          </h1>

          {/* Email */}
          <div className="w-full flex justify-between items-center bg-[var(--color-neutral)]/70 rounded-xl p-4 mb-2">
            <span className="font-semibold text-[var(--color-text-secondary)]">
              Email:
            </span>
            <span className="text-[var(--color-text-primary)]">
              {userData.email}
            </span>
          </div>

          {/* Телефон */}
          <div className="w-full flex justify-between items-center bg-[var(--color-neutral)]/70 rounded-xl p-4 mb-2">
            <span className="font-semibold text-[var(--color-text-secondary)]">
              Телефон:
            </span>
            <div className="flex items-center gap-3">
              {editingPhone ? (
                <>
                  <input
                    type="text"
                    className="px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-neutral)]"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="text-sm text-[var(--color-accent)] hover:underline"
                    onClick={handlePhoneSave}
                  >
                    Сохранить
                  </button>
                  <button
                    className="text-sm text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setEditingPhone(false);
                      setPhoneValue(userData.phone || "");
                    }}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[var(--color-text-primary)]">
                    {userData.phone || ""}
                  </span>
                  <button
                    onClick={() => setEditingPhone(true)}
                    className="text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Изменить
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Пароль */}
          <div className="w-full flex justify-between items-center bg-[var(--color-neutral)]/70 rounded-xl p-4 mb-2">
            <span className="font-semibold text-[var(--color-text-secondary)]">
              Пароль:
            </span>
            <span className="tracking-widest text-[var(--color-text-primary)]">
              {passwordDots}
            </span>
          </div>

          {/* Дата регистрации */}
          <div className="w-full flex justify-between items-center bg-[var(--color-neutral)]/70 rounded-xl p-4 mt-6">
            <span className="font-semibold text-[var(--color-text-secondary)]">
              Дата регистрации:
            </span>
            <span className="text-[var(--color-text-primary)]">{regDate}</span>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
