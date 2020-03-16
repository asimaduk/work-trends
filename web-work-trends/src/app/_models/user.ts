export class User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar: string;
    isAdmin: boolean;
    enabled: boolean;
    emailVerified: boolean;
    token?: string;
}