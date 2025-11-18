// types/user.ts
export interface AppUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
}
