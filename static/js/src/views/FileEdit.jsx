import React from 'react';
import FolderSelect from './elements/FolderSelect';
import { Modal, Input, ButtonInput } from 'react-bootstrap';
import $jq19 from 'jquery';

class FileEdit extends React.Component {
    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeParentGuid = this.changeParentGuid.bind(this);
        this.edit = this.edit.bind(this);

        this.state = {
            guid: false,
            showModal: false,
            title: '',
            accessId: false,
            tags: '',
            parentGuid: this.props.parentGuid
        };
    }

    setFile(file) {
        this.setState({
            guid: file.guid,
            title: file.title,
            accessId: file.access_id,
            tags: file.tags,
            parentGuid: this.props.parentGuid
        });
    }

    close() { this.setState({ showModal: false }); }
    open() { this.setState({ showModal: true }); }

    render() {
        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>{elgg.echo('pleiofile:edit_file')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.edit}>
                            <Input type="text" label={elgg.echo('pleiofile:name')} name="title" value={this.state.title} onChange={this.changeTitle} autoFocus="true" />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            <Input type="text" label={elgg.echo('tags')} name="tags" value={this.state.tags} onChange={this.changeTags} />
                            <FolderSelect folderTree={this.props.folderTree} folderGuid={0} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />
                            <ButtonInput type="submit" bsStyle="primary" value={elgg.echo('edit')} />
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

    changeTags(e) {
        this.setState({tags: e.target.value});
    }

    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    }

    edit(e) {
        e.preventDefault();
        this.close();

        $jq19.ajax({
            url: '/' + elgg.security.addToken("action/pleiofile/update_file"),
            data: {
                guid: this.state.guid,
                title: this.state.title,
                access_id: this.state.accessId,
                tags: this.state.tags,
                parent_guid: this.state.parentGuid
            },
            type: 'POST',
            success: function(data) {
                this.props.onComplete();
            }.bind(this)
        });
    }
}

export default FileEdit;
