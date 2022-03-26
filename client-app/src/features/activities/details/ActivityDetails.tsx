import React from "react";
import { Button, Card, Image } from "semantic-ui-react";
import { Activity } from "../../../app/models/activity";

interface Props {
    detailActivity: Activity;
    detail_cancelSelectActivity: () => void;
    detail_openForm: (id: string) => void;
}

export default function ActivityDetails({detailActivity, detail_cancelSelectActivity, detail_openForm}: Props) {
    return (
        <Card fluid>
            <Image src={`/assets/categoryImages/${detailActivity.category}.jpg`} />
            <Card.Content>
            <Card.Header>{detailActivity.title}</Card.Header>
            <Card.Meta>
                <span>{detailActivity.date}</span>
            </Card.Meta>
            <Card.Description>
                {detailActivity.description}
            </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Button.Group widths='2'>
                    <Button 
                        onClick={() => detail_openForm(detailActivity.id)} 
                        basic color="blue" content="Edit" 
                    />
                    <Button 
                        onClick={detail_cancelSelectActivity} 
                        basic color="grey" content="Cancel" 
                    />
                </Button.Group>
            </Card.Content>
        </Card>
    )
}