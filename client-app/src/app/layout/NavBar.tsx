import React from "react";
import { Button, Container, Menu } from "semantic-ui-react";

interface Props {
    nb_openForm: () => void;
}

export default function NavBar({nb_openForm}: Props){
    return (
        <Menu inverted fixed="top">
            <Container>
                <Menu.Item header>
                    <img src="/assets/logo.png" alt="logo" style={{marginRight: '10px'}} />
                    Reactivities
                </Menu.Item>
                <Menu.Item name="Activities" />
                <Menu.Item>
                    <Button onClick={nb_openForm} positive content="Create Activity" />
                </Menu.Item>
            </Container>
        </Menu>
    );
}