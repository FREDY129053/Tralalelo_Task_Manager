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

export async function updateUser(userID: string, username: string, email: string, avatar_url: string, is_admin: boolean = false, hashed_password: string): Promise<void> {
  // Тупо через PUT, Но да ладно
  return apiFetch(
    `http://localhost:8080/api/users/${userID}`,
    {method: "PUT", body: JSON.stringify({username, email, hashed_password, avatar_url, is_admin})},
    "Ошибка при обновлении пользователя"
  )
}

export async function logout(): Promise<void> {
  return apiFetch(
    "http://localhost:8080/api/users/logout",
    {method: "POST"},
    "Ошибка при выходе"
  )
}