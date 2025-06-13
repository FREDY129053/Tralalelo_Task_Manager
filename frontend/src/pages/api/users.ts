import { IUserFullInfo } from "@/interfaces/User";
import { apiFetch } from "./abstractFunctions";

export async function registerUser(
  username: string,
  password: string,
  email: string
): Promise<void> {
  return apiFetch(
    "http://localhost:8080/api/users",
    {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
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