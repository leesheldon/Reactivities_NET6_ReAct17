import { observer } from "mobx-react-lite";
import React, { Fragment } from "react";
import { Header } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";
import ActivityListItem from "./ActivityListItem";


// It is important to have observer(...) here --> if not, the Mobx does not work.
export default observer(function ActivityList() {

    const {activityStore} = useStore();
    const {groupedActivitiesByDate} = activityStore;

    return (
        <>
            {groupedActivitiesByDate.map(([group, groupedActivities]) => (
                <Fragment key={group}>
                    <Header sub color="teal">
                        {group}
                    </Header>
                    {groupedActivities.map(item => (
                        <ActivityListItem key={item.id} activity={item} />
                    ))}
                </Fragment>
            ))}
        </>        
    );
})