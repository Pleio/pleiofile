import React from 'react';
import { OrderedSet } from 'immutable';
import { Breadcrumb, DropdownButton, MenuItem } from 'react-bootstrap';
import BreadcrumbItem from './elements/BreadcrumbItem';
import FileUpload from './FileUpload';
import FolderEdit from './FolderEdit';
import FileEdit from './FileEdit';
import FileList from './FileList';
import $jq19 from 'jquery';
import { connect } from 'react-redux';
import { fetchFolder, showModal } from '../actions';

class FileBrowser extends React.Component {
    constructor(props) {
        super(props);
        //this.readHash = this.readHash.bind(this);
        //this.getItems = this.getItems.bind(this);
        //this.getTree = this.getTree.bind(this);

        this.openFolder = this.openFolder.bind(this);

        this.newFile = this.newFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.createFolder = this.createFolder.bind(this);
        this.editFolder = this.editFolder.bind(this);
    }

    componentDidMount() {
        window.addEventListener('popstate', this.onHashChange);
        this.onHashChange();
    }

    /*getItems() {
        this.getTree();
        $jq19.ajax({
            url: '/pleiofile/browse',
            dataType: 'json',
            data: {
                folder_guid: this.state.folderGuid
            },
            success: function(data) {
                this.setState({
                    accessId: data.access_id,
                    isWritable: data.is_writable,
                    breadcrumb: data.breadcrumb,
                    items: new OrderedSet(data.children)
                });
            }.bind(this)
        });
    }
    */

    /*getTree() {
        $.get('/pleiofile/folder_tree?container_guid=' + this.props.homeGuid, function(result) {
            this.setState({
                folderTree: result
            });
        }.bind(this));
    }*/

    /*openFolder(guid) {
        if (guid) {
            this.state.folderGuid = guid;
            window.location.hash = guid;
        } else {
            window.location.hash = '';
            this.state.folderGuid = this.props.homeGuid;
        }

        //this.getItems();
    }*/

    onHashChange() {
        var guid = parseInt(window.location.hash.replace("#",""));
        this.openFolder(guid);
    }

    openFolder(guid) {
        if (guid) {
            this.props.dispatch(fetchFolder(guid));
        } else if (this.props.folder.guid) {
            this.props.dispatch(fetchFolder(this.props.folder.guid));
        } else {
            this.props.dispatch(fetchFolder(this.props.homeGuid));
        }
    }

    render() {
        var breadcrumb = this.props.folder.breadcrumb.map(function(crumb) {
            return (
                <BreadcrumbItem key={crumb.guid} guid={crumb.guid} title={crumb.title} onOpenFolder={this.openFolder} />
            )
        }.bind(this));

        var home = ( <BreadcrumbItem key={this.props.homeGuid} guid={this.props.homeGuid} title="Home" onOpenFolder={this.openFolder} /> );
        breadcrumb.unshift(home);

        if (_appData['odt_enabled']) {
            var create_odt = (
                <MenuItem onClick={this.newFile}>{elgg.echo('pleiofile:create_file')}</MenuItem>
            )
        }

        if (this.props.folder.canWrite) {
                var add = (
                    <div className="pleiofile-btn-group">
                        <DropdownButton id="new" title={elgg.echo('add')} pullRight={true}>
                            {create_odt}
                            <MenuItem onClick={this.uploadFile}>{elgg.echo('pleiofile:upload_file')}</MenuItem>
                            <MenuItem onClick={this.createFolder}>{elgg.echo('pleiofile:create_folder')}</MenuItem>
                        </DropdownButton>
                    </div>
                );
        }

        return (
            <div>
                <div className="pleiofile-breadcrumb">
                    <Breadcrumb>
                        {breadcrumb}
                    </Breadcrumb>
                </div>
                {add}
                <FileList
                    items={this.props.folder.children}
                    onComplete={this.openFolder}
                    onOpenFolder={this.openFolder}
                    onEditFolder={this.editFolder}
                />
                <FileUpload onComplete={this.openFolder} />
                <FolderEdit onComplete={this.openFolder} />
                <FileEdit onComplete={this.openFolder} />
            </div>
        );
    }

    newFile() {
        var location = '/odt_editor/create/' + this.props.homeGuid;
        if (this.props.folder.guid !== this.props.homeGuid) {
            location += '?folder_guid=' + this.props.folder.guid;
        }
        window.location = location;
    }

    uploadFile() {
        this.props.dispatch(showModal('fileUpload'));
    }

    createFolder() {
        this.props.dispatch(showModal('folderEdit'));
    }

    editFolder(folder) {
        this.props.dispatch(showModal('folderEdit'));
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        folder: state.folder
    }
}

export default connect(mapStateToProps)(FileBrowser);