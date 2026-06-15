export const USER_ROLE = {
    contributor: "contributor",
    maintainer: "maintainer"
}

export interface IAuthUser {
    id: number;
    role: string;
    email?: string;
}