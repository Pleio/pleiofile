import React from 'react';
import { OrderedSet } from 'immutable';
import { Breadcrumb, DropdownButton, MenuItem } from 'react-bootstrap';
import BreadcrumbItem from './elements/BreadcrumbItem';
import Pagination from './elements/Pagination';
import FileUpload from './FileUpload';
import FolderEdit from './FolderEdit';
import FileEdit from './FileEdit';
import FileList from './FileList';
import $jq19 from 'jquery';
import { connect } from 'react-redux';
import { fetchFolder, fetchFolderTree, showModal } from '../actions';

class FileBrowser extends React.Component {
    constructor(props) {
        super(props);

        this.refreshFolder = this.refreshFolder.bind(this);
        this.openFolder = this.openFolder.bind(this);

        this.newFile = this.newFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.createFolder = this.createFolder.bind(this);
        this.editFolder = this.editFolder.bind(this);
    }

    componentDidMount() {
        var guid = parseInt(window.location.hash.replace("#",""));
        if (!guid) {
            guid = this.props.homeGuid;
        }

        this.openFolder(guid);

        if (_appData['containerGuid']) {
            this.props.dispatch(fetchFolderTree(_appData['containerGuid']));
        }
    }

    refreshFolder() {
        this.openFolder(this.props.folder.guid);
    }

    openFolder(guid, limit = 100, offset = 0) {
        window.location.hash = guid;

        if (_appData['limit']) {
            limit = _appData['limit'];
        }

        this.props.dispatch(fetchFolder(guid, limit, offset));
    }

    render() {
        var home = ( <BreadcrumbItem key={this.props.homeGuid} guid={this.props.homeGuid} title="Home" onOpenFolder={this.openFolder} /> );
        if (!_appData['isWidget']) {
            var breadcrumb = this.props.folder.breadcrumb.map(function(crumb) {
                return (
                    <BreadcrumbItem key={crumb.guid} guid={crumb.guid} title={crumb.title} onOpenFolder={this.openFolder} />
                )
            }.bind(this));

            breadcrumb.unshift(home);

            breadcrumb = (
                <Breadcrumb>
                    {breadcrumb}
                </Breadcrumb>
            )
        } else {
            breadcrumb = (
                <Breadcrumb>
                    {home}
                </Breadcrumb>
            )
        }

        if (_appData['odt_enabled'] && this.props.folder.canWriteFiles) {
            var createOdt = (
                <MenuItem onClick={this.newFile}>{elgg.echo('pleiofile:create_file')}</MenuItem>
            )
        }

        if (this.props.folder.canWriteFiles) {
            var createFile = (
                <MenuItem onClick={this.uploadFile}>{elgg.echo('pleiofile:upload_file')}</MenuItem>
            )
        }

        if (this.props.folder.canWriteFolders) {
            var createFolder = (
                <MenuItem onClick={this.createFolder}>{elgg.echo('pleiofile:create_folder')}</MenuItem>
            )
        }

        if (this.props.folder.canWriteFiles || this.props.folder.canWriteFolders) {
            var add = (
                <div className="pleiofile-btn-group">
                    <DropdownButton id="new" title={elgg.echo('add')} pullRight={true}>
                        {createOdt}
                        {createFile}
                        {createFolder}
                    </DropdownButton>
                </div>
            );
        }

        return (
            <div>
                <div className="pleiofile-breadcrumb">
                    {breadcrumb}
                </div>
                {add}
                <FileList
                    items={this.props.folder.children}
                    onComplete={this.refreshFolder}
                    onOpenFolder={this.openFolder}
                    onEditFolder={this.editFolder}
                />
                <Pagination total={this.props.folder.total} offset={this.props.folder.offset} limit={this.props.folder.limit} folderGuid={this.props.folder.guid} onOpenFolder={this.openFolder} />
                <FileUpload onComplete={this.refreshFolder} />
                <FolderEdit />
                <FileEdit />
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