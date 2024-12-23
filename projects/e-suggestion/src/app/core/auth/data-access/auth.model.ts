export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type LoginUser = {
    username: string;
    password: string;
}

export type RegisterUser = Omit<User, 'id'>;

type UserState = User & { token: string };

export type AuthState = {
    loggedIn: boolean;
    user: UserState;
};

export const initialUserValue: UserState = {
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    token: '',
};

export const authInitialState: AuthState = {
    loggedIn: false,
    user: initialUserValue,
};