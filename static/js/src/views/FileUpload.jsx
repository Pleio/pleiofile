import React from 'react';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import { connect } from 'react-redux';
import $jq19 from 'jquery';
import { fetchFolder, hideModal } from '../actions';
import AccessSelect from './elements/AccessSelect';
import WriteAccessSelect from './elements/WriteAccessSelect';

class FileUpload extends React.Component {
    constructor(props) {
        super(props);

        this.changeFiles = this.changeFiles.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeWriteAccessId = this.changeWriteAccessId.bind(this);

        this.resetState = this.resetState.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onUpload = this.onUpload.bind(this);

        this.state = {
            showModal: false,
            uploading: "waiting_for_input",
            files: [],
            tags: "",
            succeeded: new Set(),
            failed: new Set(),
            accessId: null,
            writeAccessId: null
        }
    }

    resetState() {
        this.setState({
            accessId: this.props.parent.accessId,
            writeAccessId: this.props.parent.writeAccessId,
            files: [],
            succeeded: new Set(),
            failed: new Set(),
            tags: ""
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            uploading: "waiting_for_input",
            accessId: nextProps.parent.accessId,
            writeAccessId: nextProps.parent.writeAccessId,
            files: [],
            succeeded: new Set(),
            failed: new Set(),
            tags: ""
        })
    }

    render() {
        var files = $.map(this.state.files, function(file, i) {;
            if (this.state.succeeded.has(i)) {
                var className = "success";
            } else if (this.state.failed.has(i)) {
                var className = "danger";
            }

            return (<tr key={"file-" + i} className={className}><td>{file.name}</td></tr>);
        }.bind(this));


        if (this.state.uploading === 'waiting_for_input') {
            var uploadButton = (<ButtonInput type="submit" bsStyle="primary" value={elgg.echo('upload')} disabled={this.state.files.length === 0} />)
        } else if (this.state.uploading === 'uploading') {
            var uploadButton = (
                <ButtonInput type="submit" bsStyle="primary" disabled={true}>
                    {elgg.echo('pleiofile:uploading')}
                </ButtonInput>
            );
        } else {
            var uploadButton = (
                <ButtonInput type="button" bsStyle="primary" onClick={this.onClose}>
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
                            <AccessSelect ref="accessId" label={elgg.echo('access:read')} value={this.state.accessId} onChange={this.changeAccessId} />
                            <WriteAccessSelect ref="writeAccessId" label={elgg.echo('access:write')} value={this.state.writeAccessId} onChange={this.changeWriteAccessId} />
                            <Input type="text" label={elgg.echo('tags')} name="tags" onChange={this.changeTags} value={this.state.tags} />
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

    changeWriteAccessId(e) {
        this.setState({writeAccessId: e.target.value});
    }

    changeTags(e) {
        this.setState({tags: e.target.value});
    }

    onClose(e) {
        this.resetState();
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
            data.append('write_access_id', this.state.writeAccessId);
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

                        if (this.state.failed.size == 0) {
                            this.onClose();
                        }
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