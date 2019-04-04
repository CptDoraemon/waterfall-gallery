import React from 'react';
import './uploader.css';
import { IoMdCloudUpload } from "react-icons/io";
import { FiArrowDownRight } from "react-icons/fi";
import { MdDone } from "react-icons/md";
import { MdCreateNewFolder } from "react-icons/md";
import Loader from 'react-loader-spinner'

class UploaderExpanded extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploader: null
        };
        this.mountUploader = this.mountUploader.bind(this);
    }
    mountUploader() {
        this.setState({
            uploader: <FunctionalUploader />
        })
    }
    componentDidMount() {
        setTimeout(
            this.mountUploader,
            500
        )
    }
    render() {
        return (
            <React.Fragment>
                <UploaderIcon {...this.props}/>
                { this.state.uploader }
            </React.Fragment>
        )
    }
}

function UploaderMinified(props) {
    return (
        <UploaderIcon {...props}/>
    )
}

class FunctionalUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phase: 'idle', // idle, dragOver, uploading, uploadingNoneValid, serverProcessing, success, error
            percent: 0,
            validationCheckMessage: ''
        };
        this.fileInput = React.createRef();
        this.dropEnterHandler = this.dropEnterHandler.bind(this);
        this.dropLeaveHandler = this.dropLeaveHandler.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }
    changeHandler() {
        if (this.state.phase === 'uploading') return;

        // validation check
        let files = this.fileInput.current.files;
        let selectionCount = files.length;
        let overSizedFilesName = [];
        if (selectionCount > 20) {
            files = files.slice(0, 20);
        }
        let uploadingCount = files.length;
        const form = new FormData();
        for (let i=0; i<files.length; i++) {
            if (files[i].size <= 5 * 1024 * 1024) {
                form.append('file', files[i]) // call it multiple times it will generate an array automatically
            } else {
                overSizedFilesName.push(files[i].name);
            }
        }
        uploadingCount -= overSizedFilesName.length;

        const imagePluralChecked = selectionCount === 1 ? 'image' : 'images';
        let validationCheckMessage = 'You selected ' + selectionCount + ' ' + imagePluralChecked + ', uploading ' + uploadingCount + ' ' + imagePluralChecked + '.';
        if (overSizedFilesName.length !== 0) {
            const filePluralChecked = overSizedFilesName.length > 1
                ? ' These files are discarded'
                : ' This file is discarded';
            validationCheckMessage += filePluralChecked + ' due to oversizing: ';
        }

        validationCheckMessage =
            <React.Fragment>
                <p> { validationCheckMessage } </p>
                <ol> { overSizedFilesName.length !== 0 ? overSizedFilesName.map(name => <li key={name}> { name } </li>) : null } </ol>
            </React.Fragment>;

        // update state
        if (uploadingCount === 0) {
            this.setState({
                phase: 'uploadingNoneValid',
                validationCheckMessage: validationCheckMessage
            });
        } else {
            this.setState({
                phase: 'uploading',
                validationCheckMessage: validationCheckMessage
            }, sendRequest);
        }

        // send request
        function sendRequest() {
            const xhr = new XMLHttpRequest();
            const upload = xhr.upload;
            upload.onprogress = (e) => {
                this.setState({percent: 100 * e.loaded / e.total});
            };
            upload.onerror = (e) => {
                this.setState({phase: 'error'});
            };
            upload.onload = (e) => {
                setTimeout(() => {
                    this.setState({phase: 'serverProcessing'});
                }, 1000)
            };
            xhr.onload = () => {
                if (xhr.response === 'success') {
                    setTimeout(() => {
                        this.setState({phase: 'success'});
                    }, 1000)
                } else {
                    this.setState({phase: 'error'});
                }
            };
            xhr.open('post', 'http://localhost:5000/upload', true);
            xhr.send(form);
        }
    }
    dropEnterHandler() {
        this.setState({
            phase: 'dragOver'
        })
    }
    dropLeaveHandler() {
        if (this.state.phase === 'dragOver') {
            this.setState({
                phase: 'idle'
            })
        }
    }
    render() {
        const uploaderWrapper = this.state.isDragOver
            ? 'functional-uploader-canvas functional-uploader-canvas-active'
            : 'functional-uploader-canvas';

        let text = null;
        switch (this.state.phase) {
            case 'idle':
                text =
                    <React.Fragment>
                        <h2>Drop your .jpg, .png files here!</h2>
                        <h3>Up to 20 images, max 5 MB each</h3>
                    </React.Fragment>;
                break;
            case 'dragOver':
                text = <MdCreateNewFolder size='100px' color='green'/>;
                break;
            case 'uploading':
                text =
                    <React.Fragment>
                        <Loader type="Triangle" color="green" height={80} width={80} />
                        <h3> {'Uploading ' + this.state.percent + '%'} </h3>
                        <div className='validation-check-message'> {this.state.validationCheckMessage.length === 0 ? null : this.state.validationCheckMessage} </div>
                    </React.Fragment>;
                break;
            case 'uploadingNoneValid':
                text =
                    <React.Fragment>
                        <Loader type="Triangle" color="green" height={80} width={80} />
                        <h3> {'Uploading ' + this.state.percent + '%'} </h3>
                        <div className='validation-check-message'> {this.state.validationCheckMessage.length === 0 ? null : this.state.validationCheckMessage} </div>
                    </React.Fragment>;
                break;
            case 'serverProcessing':
                text =
                    <React.Fragment>
                        <Loader type="Triangle" color="green" height={80} width={80} />
                        <h3>Server processing</h3>
                    </React.Fragment>;
                break;
            case 'success':
                text =
                    <React.Fragment>
                        <MdDone size='100px' color='green'/>
                        <h3>All set</h3>
                    </React.Fragment>;
                break;
            case 'error':
                text =
                    <React.Fragment>
                        <h3>error</h3>
                    </React.Fragment>;
                break;
            default:
                text =
                    <React.Fragment>
                        <h2>Drop your .jpg, .png files here!</h2>
                        <h3>Up to 20 images, max 5 MB each</h3>
                    </React.Fragment>;

        }
        return (
            <div className='functional-uploader-wrapper'>
                <h1>Upload new photo</h1>
                <div className={uploaderWrapper}>
                    { text }
                    <input
                        type="file"
                        id="fileSelector" name="image"
                        accept="image/png, image/jpeg"
                        multiple={true}
                        ref={this.fileInput}
                        onDragEnter={this.dropEnterHandler}
                        onDragLeave={this.dropLeaveHandler}
                        onChange={this.changeHandler}
                    />
                </div>
            </div>
        )
    }
}

function UploaderIcon(props) {
    const icon = props.isActive
        ? <FiArrowDownRight size={'30px'} />
        : <IoMdCloudUpload size={'30px'}/>;
    return (
        <div className='uploader-icon-wrapper' onClick={props.activationToggler}>
            <div className={props.isActive ? 'uploader-icon-active': 'uploader-icon-inactive'}>
                <div className='uploader-icon-centering'>
                    { icon }
                </div>
            </div>
        </div>
    )
}

class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isActive: false
        };
        this.activationToggler = this.activationToggler.bind(this);
    }
    activationToggler() {
        this.setState({
            isActive: !this.state.isActive
        })
    }
    render() {
        const propsPassOn = {
            activationToggler: this.activationToggler,
            isActive: this.state.isActive
        };
        const wrapperClassName = this.state.isActive
            ? 'uploader-wrapper-expanded'
            : 'uploader-wrapper-minified';
        const content = this.state.isActive
            ? <UploaderExpanded {...propsPassOn} />
            : <UploaderMinified {...propsPassOn} />;

        return (
            <div className={wrapperClassName}>
                { content }
            </div>
        )
    }
}

export { Uploader };