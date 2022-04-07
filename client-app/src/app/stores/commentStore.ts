import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { makeAutoObservable, runInAction } from "mobx";
import { ChatComment } from "../models/comment";
import { store } from "./store";

export default class CommentStore {
    comments: ChatComment[] = [];
    hubConnection: HubConnection | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    createHubConnection = (activityId: string) => {
        if (store.activityStore.selectedActivity) {
            this.hubConnection = new HubConnectionBuilder()
                .withUrl(process.env.REACT_APP_CHAT_URL + '?activityId=' + activityId, {
                    accessTokenFactory: () => store.userStore.user?.token!
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            this.hubConnection.start().catch(error => console.log('Error in establishing the connection: ', error));

            this.hubConnection.on('LoadComments', (loadedComments: ChatComment[]) => {
                runInAction(() => {
             // + 'Z" because these comments come from Database, without 'Z' at the end of createdAt values
            // date + Z --> UTC dates
                    loadedComments.forEach(cmt => {
                        cmt.createdAt = new Date(cmt.createdAt + 'Z');               
                    })

                    this.comments = loadedComments;
                });
            });

            this.hubConnection.on('ReceiveComment', (receivedComment: ChatComment) => {
                runInAction(() => {
            // This comment comes from SignalR, not from Database.
            // 'Z' has been at the end of createdAt value
                    receivedComment.createdAt = new Date(receivedComment.createdAt);
                    this.comments.unshift(receivedComment); // Add new item at the start of the arrray
                });
            });
        }
    }

    stopHubConnection = () => {
        this.hubConnection?.stop().catch(error => console.log('Error in stopping connection: ', error));
    }

    clearComments = () => {
        this.comments = [];
        this.stopHubConnection();
    }

    addComment = async (values: any) => {
        values.activityId = store.activityStore.selectedActivity?.id;
        try {
            await this.hubConnection?.invoke('SendComment', values);
        } catch (error) {
            console.log(error);
        }
    }

}