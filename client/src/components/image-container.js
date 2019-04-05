import React from 'react';
import './image-container.css';

import Loader from 'react-loader-spinner'


function Loading(props) {
    return (
        <div className='loading'>
            <Loader type="Triangle" color="rgb(29, 161, 242)" height={50} width={50} />
        </div>
    )
}

class ImageZoomIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            translateX: 0,
            translateY: 0,
            isReadyForFadeIn: false
        };
        this.mouseClickedPosition = this.props.mouseClickedPosition;
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }
    handleMouseMove(e) {
        const clientX = e.clientX;
        const clientY = e.clientY;
        const originX = this.mouseClickedPosition.x;
        const originY = this.mouseClickedPosition.y;
        const translateX = (originX - clientX) * 0.5;
        const translateY = (originY - clientY) * 0.5;
        this.setState({
            translateX: translateX,
            translateY: translateY
        })

    }
    componentDidMount() {
        setTimeout(() => this.setState({
            isReadyForFadeIn: true
        }), 10);
        window.addEventListener('mousemove', this.handleMouseMove)
    }
    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove)
    }
    render() {
        return (
            <div>
                <div
                    className='image-container-zoom'
                    onClick={this.props.zoomInImage}
                >
                    <img
                        src={this.props.src}
                        style={{
                            transform: 'translateX(' + this.state.translateX + 'px) ' + 'translateY(' + this.state.translateY + 'px)',
                        }}
                    />
                </div>
            </div>
        )
    }
}

class ImageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            isZoomIn: false,
            mouseClickedPosition: null
        };
        this.data = this.props.data;
        this.loading = <Loading />;
        this.loaded = null;
        this.src = null;
        this.zoomInImage = this.zoomInImage.bind(this);
    }
    zoomInImage(e) {
        const body = document.getElementsByTagName('BODY')[0];
        if (this.state.isZoomIn) {
            // zoom out
            body.style.overflow = 'auto';
            this.setState({isZoomIn: false})
        } else {
            // zoom in
            body.style.overflow = 'hidden';
            const mouseClickedPosition = {
                x: e.clientX,
                y: e.clientY
            };
            this.setState({
                isZoomIn: true,
                mouseClickedPosition: mouseClickedPosition
            })
        }
    }
    componentDidMount() {
        const loadImg = new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this.data.link;
            img.onload = () => resolve(img.src);
            img.onerror = () => reject();
        });
        loadImg.then((src) => {
            this.src = src;
            this.loaded =
                <React.Fragment>
                    <div className='image-container-image' onClick={ this.zoomInImage }> <img src={this.src} /> </div>
                    <div className='image-container-title'> { this.data.title } </div>
                    <div className='image-container-description'> { this.data.description } </div>
                </React.Fragment>;
            setTimeout(() => {
                this.setState({
                    isLoaded: true
                });
            }, Math.random() * 1000)
        })
    }

    render() {
        return (
            <React.Fragment>
                <div className='image-container-wrapper' style={{height: this.data.height + 'px'}}>
                    { this.state.isLoaded ? this.loaded : this.loading}
                </div>
                { this.state.isZoomIn
                    ? <ImageZoomIn
                        src={this.src}
                        zoomInImage={this.zoomInImage}
                        mouseClickedPosition={this.state.mouseClickedPosition}
                    />
                    : null }
            </React.Fragment>
        )
    }
}

export {ImageContainer, Loading};