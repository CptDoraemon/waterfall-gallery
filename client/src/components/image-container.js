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

class ImageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false
        };
        this.data = this.props.data;
        this.loading = <Loading />;
        this.loaded = null;
    }
    componentDidMount() {
        const loadImg = new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this.data.link;
            img.onload = () => resolve(img.src);
            img.onerror = () => reject();
        });
        loadImg.then((src) => {
            this.loaded =
                <React.Fragment>
                    <div className='image-container-image'> <img src={src} /> </div>
                    <div className='image-container-title'> { this.data.title } </div>
                    <div className='image-container-description'> { this.data.description } </div>
                </React.Fragment>;
            setTimeout(() => {
                this.setState({
                    isLoaded: true
                });
            }, Math.random() * 5000)
        })
    }

    render() {
        return (
            <div className='image-container-wrapper' style={{height: this.data.height + 'px'}}>
                { this.state.isLoaded ? this.loaded : this.loading}
            </div>
        )
    }
}

export {ImageContainer, Loading};