import React from 'react';
import FolderSelect from './elements/FolderSelect';
import { Modal, Input, ButtonInput } from 'react-bootstrap';

class FolderEdit extends React.Component {
    constructor(props) {
        super(props);
        this.setFolder = this.setFolder.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeAccessId = this.changeAccessId.bind(this);
        this.changeTags = this.changeTags.bind(this);
        this.changeParentGuid = this.changeParentGuid.bind(this);
        this.create = this.create.bind(this);

        this.state = {
            guid: false,
            title:'',
            accessId: this.props.defaultAccessId,
            tags: '',
            parentGuid: this.props.parentGuid,
            showModal: false
        };
    }

    setFolder(folder) {
        if (folder) {
            this.setState({
                guid: folder.guid,
                title: folder.title,
                accessId: folder.access_id,
                tags: folder.tags,
                parentGuid: this.props.parentGuid
            });
        } else {
            this.setState({
                guid: false,
                title:'',
                accessId: this.props.defaultAccessId,
                tags: '',
                parentGuid: this.props.parentGuid,
                showModal: false
            });
        }
    }

    close() { this.setState({ showModal: false }); }
    open() { this.setState({ showModal: true }); }

    render() {
        if (this.state.guid) {
            var modalTitle = elgg.echo('pleiofile:edit_folder');
            var buttonValue = elgg.echo('edit');
            var folderSelect = (<FolderSelect folderTree={this.props.folderTree} folderGuid={this.state.guid} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />);
        } else {
            var modalTitle = elgg.echo('pleiofile:create_folder');
            var buttonValue = elgg.echo('create');
        }

        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.create}>
                            <Input type="text" ref="title" label={elgg.echo('pleiofile:name')} value={this.state.title} onChange={this.changeTitle} autoFocus={true} />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            <Input type="text" label={elgg.echo('tags')} name="tags" value={this.state.tags} onChange={this.changeTags} />
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

    changeTags(e) {
        this.setState({tags: e.target.value});
    }

    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    }

    create(e) {
        e.preventDefault();
        this.close();

        var data = {
            'title': this.state.title,
            'access_id': this.state.accessId,
            'tags': this.state.tags,
            'parent_guid': this.state.parentGuid
        };

        if (this.state.guid) {
            data['guid'] = this.state.guid;
            var url = '/' + elgg.security.addToken("action/pleiofile/update_folder");
        } else {
            var url = '/' + elgg.security.addToken("action/pleiofile/create_folder");
        }

        $jq19.ajax({
            method: 'POST',
            url: url,
            data: data,
            success: function(data) {
                this.props.onComplete();
            }.bind(this)
        });
    }
}

export default FolderEdit;
