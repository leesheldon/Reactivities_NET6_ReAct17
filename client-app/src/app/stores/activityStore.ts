import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import {format} from 'date-fns';


export default class ActivityStore {
    activitiesRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;

    constructor() {
        makeAutoObservable(this);
    }

    get activitiesByDate() {
        return Array.from(this.activitiesRegistry.values()).sort((a, b) => a.date!.getTime() - b.date!.getTime());
    }

    private getActivityfromMemory = (id: string) => {
        return this.activitiesRegistry.get(id);
    }

    private setActivitytoMemory = (activity: Activity) => {

        activity.date = new Date(activity.date!);
        this.activitiesRegistry.set(activity.id, activity);
    }

    loadActivities = async () => {
        this.loadingInitial = true;

        try
        {
            const activities_fromApi = await agent.Activities.list();

            activities_fromApi.forEach(item => {
                this.setActivitytoMemory(item);
            });

            this.setLoadingInitial(false);
        }
        catch (error) {
            console.log(error);

            this.setLoadingInitial(false);
        }
    };

    loadActivity = async (id: string) => {
        let activity = this.getActivityfromMemory(id);

        if (activity) {
            this.selectedActivity = activity;
            return activity;
        }
        else
        {
            this.loadingInitial = true;
            
            try
            {
                activity = await agent.Activities.details(id);
                this.setActivitytoMemory(activity);

                runInAction(() => {
                    this.selectedActivity = activity;                    
                });

                this.setLoadingInitial(false);

                return activity;
            }
            catch(error)
            {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    };

    createActivity = async (activity: Activity) => {
        this.loading = true;

        try {
            await agent.Activities.create(activity);
            runInAction(() => {
                this.activitiesRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        }
        catch(error)
        {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            });
        }
    };

    updateActivity = async (activity: Activity) => {
        this.loading = true;
        
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activitiesRegistry.set(activity.id, activity);
                
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            });
        }
        catch(error)
        {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            });
        }
    };

    deleteActivity = async (id: string) => {
        this.loading = true;
        try
        {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activitiesRegistry.delete(id);
                this.loading = false;
            });
        }
        catch(error)
        {
            console.log(error);
            runInAction(() => {
                this.loading = false;
            });
        }
    };

    get groupedActivitiesByDate() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy')
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        );
    }

}