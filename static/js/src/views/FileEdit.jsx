import React from 'react';
import FolderSelect from './elements/FolderSelect';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import { connect } from 'react-redux';
import { editFile, hideModal } from '../actions';
import AccessSelect from './elements/AccessSelect';

class FileEdit extends React.Component {
    constructor(props) {
        super(props);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeWriteAccessId = this.changeWriteAccessId.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeParentGuid = this.changeParentGuid.bind(this);

        this.onClose = this.onClose.bind(this);
        this.onEdit = this.onEdit.bind(this);

        this.state = {
            guid: false,
            title: '',
            accessId: null,
            writeAccessId: null,
            tags: '',
            parentGuid: null
        };
    }

    componentWillReceiveProps(nextProps) {
        let currentItem = nextProps.modal.currentItem
        if (currentItem) {
            this.setState({
                guid: currentItem.guid,
                title: currentItem.title,
                accessId: currentItem.accessId,
                writeAccessId: currentItem.writeAccessId,
                tags: currentItem.tags,
                parentGuid: nextProps.parent.guid
            })
        } else {
            this.setState({
                guid: null,
                title: "",
                tags: "",
                accessId: nextProps.parent.accessId,
                writeAccessId: 0,
                parentGuid: nextProps.parent.guid
            })
        }
    }

    render() {
        return (
            <div>
                <Modal show={this.props.modal.current === "fileEdit"} onHide={this.onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{elgg.echo('pleiofile:edit_file')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.onEdit}>
                            <Input type="text" label={elgg.echo('pleiofile:name')} name="title" value={this.state.title} onChange={this.changeTitle} autoFocus="true" />
                            <AccessSelect ref="accessId" label={elgg.echo('access:read')} value={this.state.accessId} onChange={this.changeAccessId} />
                            <AccessSelect ref="writeAccessId" label={elgg.echo('access:write')} value={this.state.writeAccessId} onChange={this.changeWriteAccessId} />
                            <Input type="text" label={elgg.echo('tags')} name="tags" value={this.state.tags} onChange={this.changeTags} />
                            <FolderSelect folderGuid={this.state.guid} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />
                            <ButtonInput type="submit" bsStyle="primary" value={elgg.echo('edit')} />
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }

    onClose(e) {
        this.props.dispatch(hideModal('fileEdit'));
    }

    onEdit(e) {
        e.preventDefault();

        this.props.dispatch(editFile({
            guid: this.state.guid,
            title: this.state.title,
            accessId: this.state.accessId,
            writeAccessId: this.state.writeAccessId,
            tags: this.state.tags,
            parentGuid: this.state.parentGuid
        }, this.props.parent));

        this.onClose();
    }

    changeTitle(e) {
        this.setState({title: e.target.value});
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

    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        modal: state.modal,
        parent: state.folder
    }
}

export default connect(mapStateToProps)(FileEdit);