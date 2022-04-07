import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import {format} from 'date-fns';
import { store } from "./store";
import { Profile } from "../models/profile";
import { Pagination, PagingParams } from "../models/pagination";


export default class ActivityStore {
    activitiesRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;
    pagination: Pagination | null = null;
    pagingParams = new PagingParams();
    predicate = new Map().set('all', true);

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.predicate.keys(),
            () => {
                this.pagingParams = new PagingParams();
                this.activitiesRegistry.clear();
                this.loadActivities();
            });
    }

    get activitiesByDate() {
        return Array.from(this.activitiesRegistry.values()).sort((a, b) => a.date!.getTime() - b.date!.getTime());
    }

    get groupedActivitiesByDate() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) => {
                const date = format(activity.date!, 'dd MMM yyyy')
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        );
    }

    get axiosParams() {
        const params = new URLSearchParams();
        params.append('pageNumber', this.pagingParams.pageNumber.toString());
        params.append('pageSize', this.pagingParams.pageSize.toString());

        this.predicate.forEach((value, key) => {
            if (key === 'startDate') {
                params.append(key, (value as Date).toISOString());
            } else {
                params.append(key, value);
            }
        })
        
        return params;
    }

    private getActivityfromMemory = (id: string) => {
        return this.activitiesRegistry.get(id);
    }

    private setActivitytoMemory = (activity: Activity) => {
        const user = store.userStore.user;
        if (user) {
            activity.isGoing = activity.attendees?.some(x => x.username === user.username);

            activity.isHost = activity.hostUsername === user.username;

            activity.host = activity.attendees?.find(x => x.username === activity.hostUsername);
        }

        activity.date = new Date(activity.date!);
        this.activitiesRegistry.set(activity.id, activity);
    }

    setPagination = (pagination: Pagination) => {
        this.pagination = pagination;
    }

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }

    setPredicate = (predicate: string, value: string | Date) => {

        const resetPredicate = () => {
            this.predicate.forEach((value, key) => {
                if (key !== 'startDate') this.predicate.delete(key);
            })
        }

        switch (predicate) {
            case 'all':
                resetPredicate();
                this.predicate.set('all', true);
                break;
            case 'isGoing':
                resetPredicate();
                this.predicate.set('isGoing', true);
                break;
            case 'isHost':
                resetPredicate();
                this.predicate.set('isHost', true);
                break;
            case 'startDate':
                this.predicate.delete('startDate');
                this.predicate.set('startDate', value);
                break;
        }
    }

    loadActivities = async () => {
        this.loadingInitial = true;

        try
        {
            const result = await agent.Activities.list(this.axiosParams);

            result.data.forEach(item => {
                this.setActivitytoMemory(item);
            });

            this.setPagination(result.pagination);
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

//   const attendee = new Profile(user!);
// this.selectedActivity!.isCancelled
// .........
//  The ! post-fix expression operator
// may be used to assert that its operand is non-null and non-undefined 
// in contexts where the type checker is unable to conclude that fact. Specifically, the operation x! produces a value of 
// the type of x with null and undefined excluded. Similar to type assertions of the forms <T>x and x as T, 
// the ! non-null assertion operator is simply removed in the emitted JavaScript code.

    createActivity = async (activity: ActivityFormValues) => {
        const user = store.userStore.user;
        const attendee = new Profile(user!);

        try {
            await agent.Activities.create(activity);

            const newActivity = new Activity(activity);
            newActivity.hostUsername = user!.username;
            newActivity.attendees = [attendee];

            this.setActivitytoMemory(newActivity);

            runInAction(() => {
                this.selectedActivity = newActivity;
            });
        }
        catch(error)
        {
            console.log(error);
        }
    };

    updateActivity = async (activity: ActivityFormValues) => {
        
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                if (activity.id) {
                    let updatedActivity = {...this.getActivityfromMemory(activity.id), ...activity}

                    this.activitiesRegistry.set(activity.id, updatedActivity as Activity);
                    this.selectedActivity = updatedActivity as Activity;
                }                
            });
        }
        catch(error)
        {
            console.log(error);
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

    updateAttendance = async () => {
        const user = store.userStore.user;
        this.loading = true;
        try {
            await agent.Activities.attend(this.selectedActivity!.id);

            runInAction(() => {
                if (this.selectedActivity?.isGoing) {
                    this.selectedActivity.attendees = 
                        this.selectedActivity.attendees?.filter(x => x.username !== user?.username);

                    this.selectedActivity.isGoing = false;
                } 
                else {
                    const attendee = new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing = true;
                }
            });

            this.activitiesRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
        }
        catch (error)
        {
            console.log(error);
        }
        finally
        {
            runInAction(() => this.loading = false);
        }
    }

    cancelActivityToggle = async () => {
        this.loading = true;
        try
        {
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(() => {
                this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled;
                this.activitiesRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            });
        }
        catch (error)
        {
            console.log(error);
        }
        finally
        {
            runInAction(() => this.loading = false);
        }
    }

    clearSelectedActivity = () => {
        this.selectedActivity = undefined;
    }

    updateAttendeeFollowing = (username: string) => {
        this.activitiesRegistry.forEach(activity => {
            activity.attendees.forEach(attendee => {
                if (attendee.username === username) {
                    attendee.following ? attendee.followersCount-- : attendee.followersCount++;
                    attendee.following = !attendee.following;
                }
            })
        })
    }

}