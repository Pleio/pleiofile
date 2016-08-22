import React from 'react';
import FolderSelect from './elements/FolderSelect';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import { connect } from 'react-redux';
import $jq19 from 'jquery';
import { hideModal, createFolder, editFolder } from '../actions';

class FolderEdit extends React.Component {
    constructor(props) {
        super(props);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeWriteAccessId = this.changeWriteAccessId.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeParentGuid = this.changeParentGuid.bind(this);

        this.onClose = this.onClose.bind(this);
        this.onCreate = this.onCreate.bind(this);

        this.state = {
            guid: null,
            title: null,
            accessId: null,
            writeAccessId: null,
            tags: null,
            parentGuid: null
        }
    }

    componentWillReceiveProps(nextProps) {
        let currentItem = nextProps.modal.currentItem
        console.log(currentItem)
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
                writeAccessId: nextProps.parent.writeAccessId,
                parentGuid: nextProps.parent.guid
            })
        }
    }

    render() {
        if (this.props.modal.currentItem) {
            var modalTitle = elgg.echo('pleiofile:edit_folder');
            var buttonValue = elgg.echo('edit');
            var folderSelect;
            //var folderSelect = (<FolderSelect folderTree={this.props.folderTree} folderGuid={this.state.guid} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />);
        } else {
            var modalTitle = elgg.echo('pleiofile:create_folder');
            var buttonValue = elgg.echo('create');
        }

        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        return (
            <div>
                <Modal show={this.props.modal.current == "folderEdit"} onHide={this.onClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.onCreate}>
                            <Input type="text" ref="title" label={elgg.echo('pleiofile:name')} onChange={this.changeTitle} value={this.state.title} autoFocus={true} />
                            <Input type="select" ref="accessId" label={elgg.echo('access:read')} onChange={this.changeAccessId} value={this.state.accessId}>
                                {accessOptions}
                            </Input>
                            <Input type="select" ref="writeAccessId" label={elgg.echo('access:write')} onChange={this.changeWriteAccessId} value={this.state.writeAccessId}>
                                {accessOptions}
                            </Input>
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
        this.setState({accessId: e.target.value});
    }

    changeWriteAccessId(e) {
        this.setState({
            writeAccessId: e.target.value
        })
    }

    changeTags(e) {
        this.setState({tags: e.target.value});
    }

    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
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
                parentGuid: this.props.parent.guid
            }, this.props.parent));
        } else {
            this.props.dispatch(createFolder({
                title: this.state.title,
                tags: this.state.tags,
                accessId: this.state.accessId,
                writeAccessId: this.state.writeAccessId,
                parentGuid: this.props.parent.guid
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