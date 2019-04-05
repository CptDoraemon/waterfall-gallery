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
            isLoading: false,
            isNoMoreData: false
        };
        this.data = [];
        this.oneImageHeightMax = window.innerHeight * 0.7;
        this.oneImageHeightMin = 300;
        this.columnCount = 0;
        this.resizeHandler = this.resizeHandler.bind(this);
        this.requestData = this.requestData.bind(this);
        this.requestDataScrollListener = this.requestDataScrollListener.bind(this);
    }
    requestData() {
        if (this.state.isLoading || this.state.isNoMoreData) return;
        this.setState({isLoading: true});
        const newDataArray = [];

        const lastImageId = this.data.length === 0 ? 0 : this.data[this.data.length - 1]._id;
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            const receivedArray = JSON.parse(xhr.response).data;
            if (receivedArray.length < 20) {
                this.setState({isNoMoreData: true})
            }

            for (let i=0; i<receivedArray.length; i++) {
                const obj = receivedArray[i];
                if (!obj.title) obj.title = i;
                if (!obj.description) obj.description = obj.fileName;
                obj.height = Math.floor(this.oneImageHeightMin + Math.random() * (this.oneImageHeightMax - this.oneImageHeightMin));
                newDataArray.push(obj);
            }
            this.data = this.data.concat(newDataArray);
            this.processDataMasonry(newDataArray);
        };
        xhr.onerror = (e) => console.log(e);
        xhr.open('post', '/requestImage', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify({
            id: lastImageId
        }));
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
        const newColumnCount = Math.max(1, Math.floor((screenWidth / oneColumnWidth)));
        if (newColumnCount !== this.columnCount) {
            this.columnCount = newColumnCount;
            const resetProcessedData = [];
            for (let i=0; i<newColumnCount; i++) {
                resetProcessedData.push([]);
            }
            if (this.data.length === 0) {
                // component just mounted, no data yet
                this.setState({processedData: resetProcessedData}, () => this.requestData())
            } else {
                // not first time
                this.setState({processedData: resetProcessedData}, () => this.processDataMasonry(this.data))
            }
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
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('scroll', this.requestDataScrollListener);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('scroll', this.requestDataScrollListener)
    }
    render() {
        return (
            <React.Fragment>
                { this.state.processedData.length === 0
                    ? null
                    : this.state.processedData.map((array, columnIndex) => <div key={columnIndex} className='index-content-area-column'> {array.map(obj => <ImageContainer key={obj.fileName} data={obj} />)} </div>)
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

