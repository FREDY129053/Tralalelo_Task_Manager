import Image from "next/image";
import { useState } from "react";

const fields = [
  { key: "phone", label: "Телефон" },
  { key: "email", label: "Email" },
  { key: "street", label: "Адрес" },
  { key: "city", label: "Город" },
  { key: "country", label: "Страна" }
];

export default function UserCard({
  user = {
    name: "fredy",
    big_avatar: "/eblan.jpg",
    surname: "noname",
    gender: "male",
    street_name: "Gamarnika",
    street_number: 22,
    city: "Vladivostok",
    country: "Russia",
    phone: "89020602066",
    email: "fredy1290534518@gmail.com"
  }
}) {
  const [editingField, setEditingField] = useState<null | string>(null);
  const [inputValue, setInputValue] = useState("");
  const [userData, setUserData] = useState(user);

  const handleEdit = (fieldKey: string) => {
    let current = "";
    if (fieldKey === "street") current = `${userData.street_name} ${userData.street_number}`;
    else current = userData[fieldKey as keyof typeof userData] ?? "";
    setInputValue(current);
    setEditingField(fieldKey);
  };

  const handleSave = () => {
    if (!editingField) return;

    const trimmed = inputValue.trim();
    if (editingField === "street") {
      const [name, number] = trimmed.split(/(?<=\D)\s+/);
      setUserData({ ...userData, street_name: name, street_number: Number(number) });
      console.log("Изменено:", "Адрес", trimmed);
    } else {
      setUserData({ ...userData, [editingField]: trimmed });
      console.log("Изменено:", editingField, trimmed);
    }
    setEditingField(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-base)] p-4">
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl shadow-xl p-8 max-w-lg w-full flex flex-col items-center transition">
        <div className="flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-accent)] shadow-lg mb-6 group relative">
            <Image
              src={userData.big_avatar}
              alt={userData.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2 text-center">
          {userData.name} {userData.surname}
        </h1>
        <span className="text-[var(--color-accent)] text-base font-semibold uppercase mb-4 tracking-widest">
          {userData.gender}
        </span>

        {/* Поля */}
        <div className="space-y-3 w-full">
          {fields.map(({ key, label }) => {
            let value = "";
            if (key === "street") value = `${userData.street_name} ${userData.street_number}`;
            else value = userData[key as keyof typeof userData];

            return (
              <div
                key={key}
                className="bg-[var(--color-neutral)]/70 rounded-xl p-4 flex justify-between items-center gap-4"
              >
                <div className="text-[var(--color-text-secondary)] font-semibold">{label}:</div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--color-text-primary)]">{value}</span>
                  <button
                    onClick={() => handleEdit(key)}
                    className="text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Изменить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модалка */}
      {editingField && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[var(--color-bg-elevated)] p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              Изменить {fields.find(f => f.key === editingField)?.label}
            </h2>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-neutral)] mb-4"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 text-sm rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-md bg-[var(--color-accent)] text-white hover:opacity-90"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
