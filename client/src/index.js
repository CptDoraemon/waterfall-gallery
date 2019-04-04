import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Uploader } from "./components/uploader";
import { ImageContainer } from "./components/image-container";

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columnCount: 1,
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };
        this.setColumnCount = this.setColumnCount.bind(this);
    }
    setColumnCount() {
        const screenWidth = window.innerWidth * 0.9;
        console.log(screenWidth);
        const oneColumnWidth = 300;
        const newColumnCount = Math.floor((screenWidth / oneColumnWidth));
        if (newColumnCount !== this.state.columnCount) {
            this.setState({columnCount: newColumnCount})
        }
    }
    componentDidMount() {
        this.setColumnCount();
        window.addEventListener('resize', this.setColumnCount)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.setColumnCount)
    }
    render() {
        const columnsArray = [];
        for (let i=0; i<this.state.columnCount; i++) {
            const imagesArrayInOneColumn = this.state.data.map((img, index) => {
                if (index % this.state.columnCount === i) return <ImageContainer title={img}/>
            });
            const a =
                <div className='index-content-area-column'>
                    { imagesArrayInOneColumn }
                </div>;
            columnsArray.push(a);
        }
        return (
            <div className='index-wrapper'>
                <Uploader />
                <div className='index-content-area-wrapper'>
                    { columnsArray }
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));

