import React from 'react';
import './image-container.css';
import Loader from 'react-loader-spinner'

class ImageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wrapperHeight: 250
        }
    }
    componentDidMount() {
        this.setState({wrapperHeight: Math.floor((250 + Math.random() * 500))});
    }
    render() {
        const loading = <Loader type="MutatingDot" color="black" height={100} width={100} />;
        const image = <img src='https://s3.amazonaws.com/waterfall-gallery/ju31ut3fo1bz7721fwh.jpg' />
        return (
            <div className='image-container-wrapper' style={{height: this.state.wrapperHeight + 'px'}}>
                <div className='image-container-image'> { image } </div>
                <div className='image-container-title'> {this.props.title} </div>
                <div className='image-container-description'> this is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is descriptionthis is description </div>
            </div>
        )
    }
}

export {ImageContainer};