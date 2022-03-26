import React from "react";
import { Button, Item, Label, Segment } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";

interface Props {
    listActivities: Activity[];
    list_selectActivity: (id: string) => void;
    list_deleteActivity: (id: string) => void;
}

export default function ActivityList({listActivities, list_selectActivity, list_deleteActivity}: Props) {
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
                                <Button onClick={() => list_selectActivity(activity.id)} floated="right" content="View" color="blue" />
                                <Button onClick={() => list_deleteActivity(activity.id)} floated="right" content="Delete" color="red" />
                                <Label basic content={activity.category} />
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                ))}
            </Item.Group>
        </Segment>
    )
}