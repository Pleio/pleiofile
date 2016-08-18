import React from 'react';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import { connect } from 'react-redux';
import $jq19 from 'jquery';
import { hideModal } from '../actions';

class FileUpload extends React.Component {
    constructor(props) {
        super(props);

        this.onClose = this.onClose.bind(this);
        this.onUpload = this.onUpload.bind(this);

        this.setAccessId = this.setAccessId.bind(this);
        this.changeFiles = this.changeFiles.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);

        this.state = {
            showModal: false,
            uploading: 'waiting_for_input',
            files: [],
            succeeded: new Set(),
            failed: new Set(),
            accessId: null
        }
    }

    setAccessId(accessId) {
        this.setState({
            accessId: accessId
        });
    }

    render() {
        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        var files = $.map(this.state.files, function(file, i) {;
            if (this.state.succeeded.has(i)) {
                var className = "success";
            } else if (this.state.failed.has(i)) {
                var className = "danger";
            }

            return (<tr key={"file-" + i} className={className}><td>{file.name}</td></tr>);
        }.bind(this));


        if (this.state.uploading === 'waiting_for_input') {
            var uploadButton = (<ButtonInput type="submit" bsStyle="primary" value={elgg.echo('upload')} />)
        } else if (this.state.uploading === 'uploading') {
            var uploadButton = (
                <ButtonInput type="submit" bsStyle="primary" disabled={true}>
                    {elgg.echo('pleiofile:uploading')}
                </ButtonInput>
            );
        } else {
            var uploadButton = (
                <ButtonInput type="button" bsStyle="primary" onClick={this.clickCloseButton}>
                    {elgg.echo('pleiofile:close')}
                </ButtonInput>
            );
        }

        return (
            <div>
                <Modal show={this.props.modal.current === "fileUpload"} onHide={this.onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{elgg.echo('pleiofile:upload_file')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="pleiobox-upload-filelist">
                        <table className="table">
                            <tbody>
                                {files}
                            </tbody>
                        </table>
                        </div>
                        <form onSubmit={this.onUpload}>
                            <Input type="file" multiple label={elgg.echo('pleiofile:files')} name="files" onChange={this.changeFiles} />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.props.parent.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            {uploadButton}
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }

    changeFiles(e) {
        this.setState({
            files: e.target.files,
            succeeded: new Set(),
            failed: new Set()
        });
    }

    changeAccessId(e) {
        this.setState({accessId: e.target.value});
    }

    onClose(e) {
        this.props.dispatch(hideModal('fileUpload'));
    }

    onUpload(e) {
        e.preventDefault();

        this.setState({
            uploading: 'uploading'
        });

        var total = this.state.files.length;
        for (var i=0; i < this.state.files.length; i++) {

            var data = new FormData();
            var file = this.state.files[i];
            data.append('file', file);
            data.append('access_id', this.state.accessId);
            data.append('parent_guid', this.props.parent.guid);

            var options = {
                url: '/' + elgg.security.addToken("action/pleiofile/upload"),
                data: data,
                contentType: false,
                cache: false,
                processData: false,
                type: 'POST',
                success: function(i, data) {
                    this.setState({ succeeded: this.state.succeeded.add(i) });
                }.bind(this, i),
                error: function(i, data) {
                    this.setState({ failed: this.state.failed.add(i) });
                }.bind(this, i),
                complete: function(data) {
                    total -= 1;
                    if (total === 0) {
                        this.setState({
                            uploading: 'completed'
                        });
                        this.props.onComplete();
                    }
                }.bind(this)
            };

            $jq19.ajax(options);
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        modal: state.modal,
        parent: state.folder
    }
}

export default connect(mapStateToProps)(FileUpload);