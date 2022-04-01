import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";
import { history } from '../..';

export default class UserStore {
    user: User | null = null;

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
            runInAction(() => this.user = currentUser);
        } catch(error) {
            console.log(error);
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const registered_User = await agent.Account.register(creds);

            store.commonStore.setToken(registered_User.token);

            runInAction(() => this.user = registered_User);

            history.push('/activities');
            store.modalStore.closeModal();
            
        } catch(error) {
            throw error;
        }
    }

}