import React from 'react';
import FolderSelect from './elements/FolderSelect';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import { connect } from 'react-redux';
import $jq19 from 'jquery';
import { hideModal, createFolder, editFolder } from '../actions';
import AccessSelect from './elements/AccessSelect';
import WriteAccessSelect from './elements/WriteAccessSelect';

class FolderEdit extends React.Component {
    constructor(props) {
        super(props);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeWriteAccessId = this.changeWriteAccessId.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeParentGuid = this.changeParentGuid.bind(this);
        this.changeUpdateChildren = this.changeUpdateChildren.bind(this);

        this.onClose = this.onClose.bind(this);
        this.onCreate = this.onCreate.bind(this);

        this.state = {
            guid: null,
            title: null,
            accessId: null,
            writeAccessId: null,
            tags: null,
            showUpdateChildren: false,
            updateChildren: false,
            parentGuid: null
        }
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
                updateChildren: false,
                showUpdateChildren: false,
                parentGuid: nextProps.parent.guid
            })
        } else {
            this.setState({
                guid: null,
                title: "",
                tags: "",
                accessId: nextProps.parent.accessId,
                writeAccessId: nextProps.parent.writeAccessId,
                updateChildren: false,
                showUpdateChildren: false,
                parentGuid: nextProps.parent.guid
            })
        }
    }

    render() {
        if (this.props.modal.currentItem) {
            var modalTitle = elgg.echo('pleiofile:edit_folder');
            var buttonValue = elgg.echo('edit');
            var folderSelect = (
                <FolderSelect folderTree={this.props.folderTree} folderGuid={this.state.guid} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />
            );
        } else {
            var folderSelect = "";
            var modalTitle = elgg.echo('pleiofile:create_folder');
            var buttonValue = elgg.echo('create');
        }

        let updateChildren = "";
        if (this.state.showUpdateChildren) {
            updateChildren = (
                <Input type="checkbox" label={elgg.echo('pleiofile:update_children')} onChange={this.changeUpdateChildren} value={false} />
            );
        }

        return (
            <div>
                <Modal show={this.props.modal.current == "folderEdit"} onHide={this.onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.onCreate}>
                            <Input type="text" ref="title" label={elgg.echo('pleiofile:name')} onChange={this.changeTitle} value={this.state.title} autoFocus={true} />
                            <AccessSelect ref="accessId" label={elgg.echo('access:read')} value={this.state.accessId} onChange={this.changeAccessId} />
                            <WriteAccessSelect ref="writeAccessId" label={elgg.echo('access:write')} value={this.state.writeAccessId} onChange={this.changeWriteAccessId} />
                            {updateChildren}
                            <Input type="text" label={elgg.echo('tags')} name="tags" onChange={this.changeTags} value={this.state.tags} />
                            {folderSelect}
                            <ButtonInput type="submit" bsStyle="primary" value={buttonValue} />
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }

    changeTitle(e) {
        this.setState({title: e.target.value});
    }

    changeAccessId(e) {
        this.setState({
            accessId: e.target.value,
            showUpdateChildren: true
        });
    }

    changeWriteAccessId(e) {
        this.setState({
            writeAccessId: e.target.value,
            showUpdateChildren: true
        })
    }

    changeTags(e) {
        this.setState({tags: e.target.value});
    }

    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    }

    changeUpdateChildren(e) {
        this.setState({updateChildren: e.target.checked});
    }

    onClose(e) {
        this.props.dispatch(hideModal('folderEdit'));
    }

    onCreate(e) {
        e.preventDefault();
        this.onClose();

        if (this.state.guid) {
            this.props.dispatch(editFolder({
                guid: this.state.guid,
                title: this.state.title,
                tags: this.state.tags,
                accessId: this.state.accessId,
                writeAccessId: this.state.writeAccessId,
                updateChildren: this.state.updateChildren,
                parentGuid: this.state.parentGuid
            }, this.props.parent));
        } else {
            this.props.dispatch(createFolder({
                title: this.state.title,
                tags: this.state.tags,
                accessId: this.state.accessId,
                writeAccessId: this.state.writeAccessId,
                parentGuid: this.state.parentGuid
            }, this.props.parent));
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        modal: state.modal,
        parent: state.folder
    }
}

export default connect(mapStateToProps)(FolderEdit);