import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    agent.Activities.list().then(response => {
      let listOfActivities: Activity[] = [];

      response.forEach(item => {
        item.date = item.date.split('T')[0];

        listOfActivities.push(item);
      });

      setActivities(listOfActivities);

      setLoading(false);
    });
  }, []);

  function handleSelectActivity(id: string) {
    setSelectedActivity(activities.find(x => x.id === id));
  }

  function handleCancelSelectActivity() {
    setSelectedActivity(undefined);
  }

  function handleFormOpen(id?: string) {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleFormClose(id?: string) {
    setEditMode(false);
  }

  function handleCreateOrEditActivity(activity: Activity) {
    setSubmitting(true);

    if (activity.id) {
      // update activity
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(x => x.id !== activity.id), activity]);
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmitting(false);
      });
    } else {
      // create new activity
      activity.id = uuid();

      agent.Activities.create(activity).then(() => {
        setActivities([...activities, activity]);
        setSelectedActivity(activity);
        setEditMode(false);
        setSubmitting(false);
      });
    }

  }

  function handleDeleteActivity(id: string) {
    setSubmitting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(x => x.id !== id)]);
      setSubmitting(false);
    });
    
  }

  if (loading) return <LoadingComponent content='Loading App' />

  return (
    <>
      <NavBar nb_openForm={handleFormOpen} />
        <Container style={{marginTop: '7em'}}>
          <ActivityDashboard 
            dashActivities={activities}
            dashSelectedActivity={selectedActivity}
            dash_selectActivity={handleSelectActivity}
            dash_cancelSelectActivity={handleCancelSelectActivity}
            dash_editMode={editMode}
            dash_openForm={handleFormOpen}
            dash_closeForm={handleFormClose}
            dash_createOrEdit={handleCreateOrEditActivity}
            dash_deleteActivity={handleDeleteActivity}
            dash_submitting={submitting}
          />
        </Container>
    </>
  );
}

export default App;
