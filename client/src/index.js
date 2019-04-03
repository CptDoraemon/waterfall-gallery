import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { Uploader } from "./components/uploader";

class Index extends React.Component {
    render() {
        return (
            <div className='index-wrapper'>
                <Uploader />
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));

