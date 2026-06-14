export interface IUser {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}