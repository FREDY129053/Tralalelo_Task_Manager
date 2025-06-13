import { IUserFullInfo } from "@/interfaces/User";
import { apiFetch } from "./abstractFunctions";
import { Role } from "@/interfaces/Board";

export async function registerUser(
  username: string,
  password: string,
  email: string
): Promise<Record<string, string>> {
  return apiFetch(
    "http://localhost:8080/api/users",
    {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    },
    "Ошибка при регистрации пользователя"
  );
}

export async function loginUser(username: string, password: string): Promise<Record<string, string>> {
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

export async function getRole(boardID: string): Promise<Record<string, Role>> {
  return apiFetch(
    `http://localhost:8080/api/users/role/${boardID}`,
    {method: "GET"},
    "Ошибка при получении роли"
  )
}