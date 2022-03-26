import React, { SyntheticEvent, useState } from "react";
import { Button, Item, Label, Segment } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";

interface Props {
    listActivities: Activity[];
    list_selectActivity: (id: string) => void;
    list_deleteActivity: (id: string) => void;
    list_submitting: boolean;
}

export default function ActivityList({listActivities, list_selectActivity, list_deleteActivity, list_submitting}: Props) {
    const [target, setTarget] = useState('');

    function handleActivityDelete(e: SyntheticEvent<HTMLButtonElement>, id: string) {
        setTarget(e.currentTarget.name);
        list_deleteActivity(id);
    }

    return (
        <Segment>
            <Item.Group divided>
                {listActivities.map(activity => (
                    <Item key={activity.id}>
                        <Item.Content>
                            <Item.Header as='a'>{activity.title}</Item.Header>
                            <Item.Meta>{activity.date}</Item.Meta>
                            <Item.Description>
                                <div>{activity.description}</div>
                                <div>{activity.city}, {activity.venue}</div>
                            </Item.Description>
                            <Item.Extra>
                                <Button 
                                    onClick={() => list_selectActivity(activity.id)} 
                                    floated="right" 
                                    content="View" 
                                    color="blue" 
                                />
                                <Button 
                                    name={activity.id}
                                    loading={list_submitting && target === activity.id} 
                                    onClick={(e) => handleActivityDelete(e, activity.id)} 
                                    floated="right" 
                                    content="Delete" 
                                    color="red" 
                                />
                                <Label basic content={activity.category} />
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                ))}
            </Item.Group>
        </Segment>
    )
}