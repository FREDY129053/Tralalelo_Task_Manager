import { IUserFullInfo } from "@/interfaces/User";
import { apiFetch } from "./abstractFunctions";

export async function registerUser(
  username: string,
  password: string,
  email: string,
  phone: string
): Promise<void> {
  // TODO: номера в API посылать только с +7 и без лишних символов других. С 8 не хавает, остальные из регулярки может съест в душе не ебу т.к. надо тестить было кому-то это а не втыкать нахер по приколу вещь из доки
  return apiFetch(
    "http://localhost:8080/api/users",
    {
      method: "POST",
      body: JSON.stringify({ username, password, email, phone }),
    },
    "Ошибка при регистрации пользователя"
  );
}

export async function loginUser(username: string, password: string) {
  return apiFetch(
    "http://localhost:8080/api/users/login",
    { method: "POST", body: JSON.stringify({ username, password }) },
    "Ошибка при входе. Проверьте введенные данные"
  );
}

export async function getProfile(): Promise<IUserFullInfo> {
  return apiFetch(
    "http://localhost:8080/api/users/me",
    {method: "GET"},
    "Ошибка при получении пользователя"
  )
}