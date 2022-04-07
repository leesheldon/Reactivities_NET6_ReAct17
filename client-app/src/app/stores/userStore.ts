import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";
import { history } from '../..';

export default class UserStore {
    user: User | null = null;
    refreshTokenTimeout: any;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        try {
            const loggedIn_User = await agent.Account.login(creds);

            store.commonStore.setToken(loggedIn_User.token);
            this.startRefreshTokenTimer(loggedIn_User);

            runInAction(() => this.user = loggedIn_User);

            history.push('/activities');
            store.modalStore.closeModal();

        } catch(error) {
            throw error;
        }
    }

    logout = async () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        history.push('/');
    }

    getUser = async () => {
        try {
            const currentUser = await agent.Account.current();
            store.commonStore.setToken(currentUser.token);

            runInAction(() => this.user = currentUser);

            this.startRefreshTokenTimer(currentUser);
        } catch(error) {
            console.log(error);
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const registered_User = await agent.Account.register(creds);

            store.commonStore.setToken(registered_User.token);
            this.startRefreshTokenTimer(registered_User);

            runInAction(() => this.user = registered_User);

            history.push('/activities');
            store.modalStore.closeModal();
            
        } catch(error) {
            throw error;
        }
    }

    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }

    setDisplayName = (name: string) => {
        if (this.user) {
            this.user.displayName = name;
        }
    }

    refreshToken = async () => {
        this.stopRefreshTokenTimer();

        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefreshTokenTimer(user);
        } catch (error) {
            console.log(error);
        }
    }

    private startRefreshTokenTimer(user: User) {
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);

        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

}