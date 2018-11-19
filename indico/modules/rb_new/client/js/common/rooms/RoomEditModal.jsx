/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import fetchRoomURL from 'indico-url:rooms_new.admin_room';
import fetchRoomAttributesURL from 'indico-url:rooms_new.admin_room_attributes';
import fetchAttributesURL from 'indico-url:rooms_new.admin_attributes';
import fetchAvailabilityURL from 'indico-url:rooms_new.admin_room_availability';
import _ from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types';
import {Button, Checkbox, Dimmer, Dropdown, Form, Grid, Header, Input, Loader, Modal} from 'semantic-ui-react';
// import Dropzone from 'react-dropzone';
import {Form as FinalForm, Field} from 'react-final-form';
import {indicoAxios, handleAxiosError} from 'indico/utils/axios';
import camelizeKeys from 'indico/utils/camelize';
import {ReduxCheckboxField, ReduxFormField} from 'indico/react/forms';
import {Translate} from 'indico/react/i18n';
import SpriteImage from '../../components/SpriteImage';
import * as roomActions from './actions';


function validate() {
}

const columns = [
    [{
        type: 'header',
        label: Translate.string('Image')
    }, {
        type: 'image',
    }, {
        type: 'header',
        label: Translate.string('Contact')
    }, {
        type: 'input',
        name: 'ownerName',
        label: Translate.string('Owner')
    }, {
        type: 'input',
        name: 'keyLocation',
        label: Translate.string('Where is the key?')
    }, {
        type: 'input',
        name: 'telephone',
        label: Translate.string('Telephone')
    }, {
        type: 'header',
        label: Translate.string('Information')
    }, {
        type: 'formgroup',
        key: 'information',
        content: [{
            type: 'input',
            name: 'capacity',
            label: Translate.string('Capacity(seats)')
        }, {
            type: 'input',
            name: 'division',
            label: Translate.string('Division')
        }]
    }], [{
        type: 'header',
        label: Translate.string('Location')
    }, {
        type: 'input',
        name: 'name',
        label: Translate.string('Name')
    }, {
        type: 'input',
        name: 'site',
        label: Translate.string('Site')
    }, {
        type: 'formgroup',
        key: 'details',
        content: [{
            type: 'input',
            name: 'building',
            label: Translate.string('Building')
        }, {
            type: 'input',
            name: 'floor',
            label: Translate.string('Floor')
        }, {
            type: 'input',
            name: 'number',
            label: Translate.string('Number')
        }]
    }, {
        type: 'formgroup',
        key: 'coordinates',
        content: [{
            type: 'input',
            name: 'longitude',
            label: Translate.string('longitude')
        }, {
            type: 'input',
            name: 'latitude',
            label: Translate.string('latitude')
        }]
    }, {
        type: 'input',
        name: 'surfaceArea',
        label: Translate.string('Surface Area (m2)')
    }, {
        type: 'input',
        name: 'maxAdvanceDays',
        label: Translate.string('Maximum advance time for bookings (days)')
    }], [{
        type: 'header',
        label: 'Options',
    }, {
        type: 'checkbox',
        name: 'isActive',
        label: Translate.string('Active')
    }, {
        type: 'checkbox',
        name: 'isPublic',
        label: Translate.string('Public')
    }, {
        type: 'checkbox',
        name: 'isAutoConfirm',
        label: Translate.string('Confirmation')
    }, {
        type: 'checkbox',
        name: 'reminders',
        label: Translate.string('Reminders Enabled')
    }, {
        type: 'input',
        name: 'dayReminder',
        label: Translate.string('Send Booking reminders X days before (single/day)')
    }, {
        type: 'input',
        name: 'weekReminder',
        label: Translate.string('Send Booking reminders X days before (weekly)')
    }, {
        type: 'input',
        name: 'monthReminder',
        label: Translate.string('Send Booking reminders X days before (monthly)')
    }, {
        type: 'header',
        label: 'Custom Attributes'
    }, {
        type: 'dropdown',
        version: 'attributes',
    }, {
        type: 'addButton',
        editType: 'attributes',
    }, {
        type: 'attributes'
    }]];


class RoomEditModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        roomId: PropTypes.number.isRequired,
        actions: PropTypes.exact({
            updateRoom: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        attributes: null,
        room: null,
        roomAttributes: null,
        newAttributes: [],
        availability: null,
    };

    componentDidMount() {
        this.fetchDetailedRoom();
        this.fetchRoomAttributes();
        this.fetchAttributes();
        this.fetchRoomAvailability();
    }
    //
    // onDrop = (acceptedFiles, rejectedFiles) => {
    //     console.warn(acceptedFiles);
    //     console.warn(rejectedFiles);
    // };

    onEditHours = () => {
    };

    onEditAttributes = () => {
        this.addAttributes();
    };

    async fetchDetailedRoom() {
        const {roomId} = this.props;
        let response;
        try {
            response = await indicoAxios.get(fetchRoomURL({room_id: roomId}));
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({room: camelizeKeys(response.data)});
    }

    async fetchRoomAttributes() {
        const {roomId} = this.props;
        let response;
        try {
            response = await indicoAxios.get(fetchRoomAttributesURL({room_id: roomId}));
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({roomAttributes: response.data});
    }

    async fetchAttributes() {
        let response;
        try {
            response = await indicoAxios.get(fetchAttributesURL());
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({attributes: response.data});
    }


    async fetchRoomAvailability() {
        let response;
        try {
            response = await indicoAxios.get(fetchAvailabilityURL());
        } catch (error) {
            handleAxiosError(error);
            return;
        }
        this.setState({availability: response.data});
    }

    handleCloseModal = () => {
        const {onClose} = this.props;
        onClose();
    };

    handleSubmit = async (formData) => {
        const {actions: {updateRoom}, room: {id}} = this.props;
        const rv = await updateRoom(id, formData);
        if (rv.error) {
            return rv.error;
        }
    };

    renderImage = (position) => {
        return (
            <>
                {/* <Dropzone key={position} onDrop={this.onDrop}> */}
                <SpriteImage pos={position} />
                {/* </Dropzone> */}
            </>);
    };

    removeAttribute = (attribute) => {
        const {roomAttributes} = this.state;
        this.setState({roomAttributes: _.omit(roomAttributes, attribute)});
    };

    renderAttributes = () => {
        const {attributes, roomAttributes} = this.state;
        if (!attributes) {
            return;
        }
        return attributes.map(attribute => (
            <>
                {_.has(roomAttributes, attribute.name) && (
                    <Field name={attribute.name}
                           component={ReduxFormField}
                           label={attribute.name}
                           as={Input}
                           icon={{name: 'remove', color: 'red', circular: true, link: true, onClick: () => this.removeAttribute(attribute.name)}} />
                )} </>

        ));
    };

    renderAddButton = (type) => {
        const {attributes} = this.state;
        return (
            <Button disabled={attributes.length === 0}
                    default
                    size="tiny"
                    floated="right"
                    onClick={type === 'attributes' ? this.onEditAttributes : this.onEditHours}>
                Add
            </Button>
        );
    };

    renderColumn = (column, key) => (
        <Grid.Column key={key}>{column.map(this.renderContent)}</Grid.Column>
    );

    renderContent = (content) => {
        const {room, attributes} = this.state;
        let options;
        switch (content.type) {
            case 'header':
                return (
                    <Header key={content.label}>{content.label}</Header>
                );
            case 'input':
                return (
                    <Field key={content.name}
                           name={content.name}
                           component={ReduxFormField}
                           label={content.label}
                           as="input" />
                );
            case 'formgroup':
                return (
                    <Form.Group key={content.key}>
                        {content.content.map(this.renderContent)}
                    </Form.Group>
                );
            case 'checkbox':
                return (
                    <Field key={content.name}
                           name={content.name}
                           component={ReduxCheckboxField}
                           componentLabel={content.label}
                           as={Checkbox} />
                );
            case 'image':
                return this.renderImage(room.spritePosition);
            case 'attributes':
                return this.renderAttributes();
            case 'addButton':
                return this.renderAddButton(content.editType);
            case 'dropdown':
                if (!attributes) {
                    return;
                }
                options = this.generateOptions(attributes);
                return (
                    <Dropdown placeholder="Add new attributes"
                              fluid
                              multiple
                              selection
                              options={options}
                              onChange={(event, values) => this.setState({newAttributes: values.value})} />
                );
        }
    };


    renderModalContent = (fprops) => {
        const formProps = {onSubmit: fprops.handleSubmit};
        return (
            <>
                <Modal.Header>
                    <Translate>Edit Room Details</Translate>
                </Modal.Header>
                <Modal.Content>
                    <Form id="room-form" {...formProps}>
                        <Grid columns={3}>
                            {columns.map(this.renderColumn)}
                        </Grid>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button type="submit"
                            form="room-form"
                            primary>
                        <Translate>Save</Translate>
                    </Button>
                </Modal.Actions>
            </>
        );
    };

    addAttributes = () => {
        const {roomAttributes, attributes, newAttributes} = this.state;

        const attributesObj = _.keyBy(attributes, 'name');
        let newRoomAttributes = {};
        newAttributes.map((attr) => {
            newRoomAttributes = {...{[attributesObj[attr].name]: null}, ...newRoomAttributes};
            return newRoomAttributes;
        });
        this.setState({roomAttributes: {...roomAttributes, ...newRoomAttributes}});
    };

    generateOptions = (attributes) => {
        const {roomAttributes} = this.state;
        const options = [];
        attributes.map((key) => (!roomAttributes.hasOwnProperty(key.name)
            ? options.push({key: key.name, text: key.title, value: key.name}) : null));
        return options;
    };


    render() {
        const {room, roomAttributes, attributes} = this.state;
        const props = {validate, onSubmit: this.handleSubmit};
        if (!room || !attributes || !roomAttributes) {
            return <Dimmer active page><Loader /></Dimmer>;
        }
        return (
            <>
                <Modal open onClose={this.handleCloseModal} size="large" closeIcon>
                    <FinalForm {...props}
                               render={this.renderModalContent}
                               initialValues={{...room, ...roomAttributes}} />
                </Modal>
            </>
        );
    }
}

export default connect(
    null,
    dispatch => ({
        actions: bindActionCreators({
            updateRoom: roomActions.updateRoom,
        }, dispatch)
    })
)(RoomEditModal);