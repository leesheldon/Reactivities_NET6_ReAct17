import React from "react";
import { Grid } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";
import ActivityList from "./ActivityList";

interface Props {
    dashActivities: Activity[];
    dashSelectedActivity: Activity | undefined;
    dash_selectActivity: (id: string) => void;
    dash_cancelSelectActivity: () => void;
    dash_editMode: boolean;
    dash_openForm: (id: string) => void;
    dash_closeForm: () => void;
    dash_createOrEdit: (cr_ed_activity: Activity) => void;
    dash_deleteActivity: (id: string) => void;
    dash_submitting: boolean;
}

export default function ActivityDashboard({dashActivities, dashSelectedActivity, 
        dash_selectActivity, dash_cancelSelectActivity, 
        dash_editMode, dash_openForm, dash_closeForm, dash_createOrEdit, 
        dash_deleteActivity, dash_submitting}: Props) {
    return (
        <Grid>
            <Grid.Column width='10'>
                <ActivityList 
                    listActivities={dashActivities} 
                    list_selectActivity={dash_selectActivity} 
                    list_deleteActivity={dash_deleteActivity} 
                    list_submitting={dash_submitting}
                />
            </Grid.Column>
            <Grid.Column width='6'>
                {dashSelectedActivity && !dash_editMode && 
                <ActivityDetails 
                    detailActivity={dashSelectedActivity} 
                    detail_cancelSelectActivity={dash_cancelSelectActivity}
                    detail_openForm={dash_openForm}
                />}
                {dash_editMode && 
                <ActivityForm 
                    frm_closeForm={dash_closeForm} 
                    frm_activity={dashSelectedActivity} 
                    createOrEdit={dash_createOrEdit} 
                    submitting={dash_submitting}
                />}
            </Grid.Column>
        </Grid>
    );
}