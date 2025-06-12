export interface IUserFullInfo {
  username: string,
  email: string,
  phone: string | null,
  avatar_url: string,
  is_admin: boolean,
  hashed_password: string,
  id: string,
  registered_at: string
}