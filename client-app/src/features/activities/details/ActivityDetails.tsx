import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/stores/store";
import ActivityDetailsChat from "./ActivityDetailsChat";
import ActivityDetailsHeader from "./ActivityDetailsHeader";
import ActivityDetailsInfo from "./ActivityDetailsInfo";
import ActivityDetailsSideBar from "./ActivityDetailsSideBar";


export default observer(function ActivityDetails() {
    const {activityStore} = useStore();
    const {selectedActivity: activity, loadActivity, loadingInitial} = activityStore;
    const {id} = useParams<{id: string}>();

    useEffect(() =>{
        if (id) loadActivity(id);
    }, [id, loadActivity]);

    if (loadingInitial || !activity) return <LoadingComponent />;
    
    return (
        <Grid>
            <Grid.Column width={10}>
                <ActivityDetailsHeader activity={activity} />
                <ActivityDetailsInfo activity={activity} />
                <ActivityDetailsChat />
            </Grid.Column>
            <Grid.Column width={6}>
                <ActivityDetailsSideBar />
            </Grid.Column>
        </Grid>
    )
})