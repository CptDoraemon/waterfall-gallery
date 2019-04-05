import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Uploader } from "./components/uploader";
import { ImageContainer, Loading } from "./components/image-container";

class AllImages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processedData: [],
            isLoading: false
        };
        this.data = [];
        this.oneImageHeightMax = window.innerHeight * 0.7;
        this.oneImageHeightMin = 300;
        this.columnCount = 1;
        this.resizeHandler = this.resizeHandler.bind(this);
        this.requestData = this.requestData.bind(this);
        this.requestDataScrollListener = this.requestDataScrollListener.bind(this);
    }
    requestData() {
        if (this.state.isLoading) return;
        this.setState({isLoading: true});
        const newDataArray = [];
        for (let i=0; i<20; i++) {
            newDataArray.push({
                title: i,
                description: 'this is description',
                link: 'https://s3.amazonaws.com/waterfall-gallery/ju31ut3fo1bz7721fwh.jpg',
                height: Math.floor(this.oneImageHeightMin + Math.random() * (this.oneImageHeightMax - this.oneImageHeightMin))
            })
        }
        this.data = this.data.concat(newDataArray);
        setTimeout(() => this.processDataMasonry(newDataArray), 2000)
    }
    requestDataScrollListener() {
        const viewBottom = window.pageYOffset + window.innerHeight;
        const bodyHeight = document.body.scrollHeight;
        if (bodyHeight - viewBottom < 0.3 * window.innerHeight) {
            this.requestData()
        }
    };
    resizeHandler() {
        const screenWidth = window.innerWidth * 0.9;
        const oneColumnWidth = 300;
        const newColumnCount = Math.floor((screenWidth / oneColumnWidth));
        if (newColumnCount !== this.columnCount) {
            this.columnCount = newColumnCount;
            const resetProcessedData = [];
            for (let i=0; i<newColumnCount; i++) {
                resetProcessedData.push([]);
            }
            this.setState({processedData: resetProcessedData}, this.processDataMasonry(this.data))
        }
    }
    processDataMasonry(array) {
        const columnsHeights = [];
        const processedData = this.state.processedData.slice();
        processedData.map(arr => {
            if (arr.length === 0) {
                columnsHeights.push(0)
            } else {
                let sum = 0;
                arr.map(obj => {
                    sum += obj.height
                });
                columnsHeights.push(sum)
            }
        });
        //
        array.map((obj, index) => {
            let shortestColumnOrder = 0;
            columnsHeights.map((height, index) => {
                if (height < columnsHeights[shortestColumnOrder]) shortestColumnOrder = index;
            });
            columnsHeights[shortestColumnOrder] += obj.height;
            processedData[shortestColumnOrder].push(obj);
        });
        //
        this.setState({
            processedData: processedData,
            isLoading: false
        })
    }
    componentDidMount() {
        this.resizeHandler();
        this.requestData();
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('scroll', this.requestDataScrollListener);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('scroll', this.requestDataScrollListener)
    }
    render() {
        console.log(this.state.processedData);
        return (
            <React.Fragment>
                { this.state.processedData.length === 0
                    ? null
                    : this.state.processedData.map((array) => <div className='index-content-area-column'> {array.map(obj => <ImageContainer data={obj} />)} </div>)
                }

                {
                    this.state.isLoading ? <Loading /> : null
                }

            </React.Fragment>
        )
    }
}

class Index extends React.Component {
    render() {
        return (
            <div className='index-wrapper'>
                <Uploader />
                <div className='index-content-area-wrapper'>
                    <AllImages />
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));

