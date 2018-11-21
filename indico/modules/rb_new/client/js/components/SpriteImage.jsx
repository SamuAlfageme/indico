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

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import roomsSpriteURL from 'indico-url:rooms_new.sprite';
import * as configSelectors from '../common/config/selectors';


const DEFAULT_WIDTH = 290;
const DEFAULT_HEIGHT = 170;

/**
 * This component creates an image based on the "room photo" sprite.
 */
class SpriteImage extends React.Component {
    static propTypes = {
        /** The caching token generated by the server */
        roomsSpriteToken: PropTypes.string.isRequired,
        /** The position of the sprite in the spritesheet */
        pos: PropTypes.number.isRequired,
        /** The height the component should assume */
        height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        /** The width the component should assume */
        width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        /** Additional styles to be applied on the component */
        styles: PropTypes.object,
        /** Whether the image should try to fit vertically instead of horizontally */
        fillVertical: PropTypes.bool
    };

    static defaultProps = {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        styles: {},
        fillVertical: false
    };

    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.state = {};
    }

    componentDidMount() {
        // It's OK to call setState(...) here, since the component
        // has to re-render anyway
        //
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({
            contHeight: this.containerRef.current.offsetHeight,
            contWidth: this.containerRef.current.offsetWidth
        });
    }

    render() {
        const {pos, width, height, styles, roomsSpriteToken, fillVertical} = this.props;
        const {contWidth, contHeight} = this.state;

        const imgStyle = {
            backgroundImage: `url(${roomsSpriteURL({version: roomsSpriteToken})})`,
            backgroundPosition: `-${DEFAULT_WIDTH * pos}px 0`,
            backgroundRepeat: 'no-repeat',
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            transformOrigin: 'top left'
        };

        if (fillVertical) {
            const scale = contHeight / DEFAULT_HEIGHT;
            Object.assign(imgStyle, {
                transform: `translateX(${-((DEFAULT_WIDTH * scale) - contWidth) / 2}px) scale(${scale})`
            });
        } else {
            const scale = contWidth / DEFAULT_WIDTH;
            Object.assign(imgStyle, {
                transform: `translateY(${-((DEFAULT_HEIGHT * scale) - contHeight) / 2}px) scale(${scale})`
            });
        }

        const containerStyle = {
            overflow: 'hidden',
            width,
            height,
            ...styles
        };

        return (
            <div style={containerStyle} ref={this.containerRef}>
                <div style={imgStyle} className="img" />
            </div>
        );
    }
}

export default connect(
    state => ({
        roomsSpriteToken: configSelectors.getRoomsSpriteToken(state)
    })
)(SpriteImage);
