import {User} from "@/types/User";

export interface AuthResponse {
    user: User;
    accessToken: string;
    expiresIn: number;
}