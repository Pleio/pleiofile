import React from 'react';
import { OrderedSet } from 'immutable';
import { Breadcrumb, DropdownButton, MenuItem } from 'react-bootstrap';
import BreadcrumbItem from './elements/BreadcrumbItem';
import FileUpload from './FileUpload';
import FolderEdit from './FolderEdit';
import FileEdit from './FileEdit';
import FileList from './FileList';
import $jq19 from 'jquery';

class FileBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.readHash = this.readHash.bind(this);
        this.getItems = this.getItems.bind(this);
        this.getTree = this.getTree.bind(this);
        this.openFolder = this.openFolder.bind(this);
        this.sort = this.sort.bind(this);
        this.newFile = this.newFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.editFile = this.editFile.bind(this);
        this.createFolder = this.createFolder.bind(this);
        this.editFolder = this.editFolder.bind(this);

        this.state = {
            folderGuid: this.props.homeGuid,
            folderTree: [],
            breadcrumb: [],
            items: new OrderedSet,
            sortOn: 'title',
            sortAscending: true,
            accessId: null,
            isWritable: false
        };
    }

    componentDidMount() {
        window.addEventListener('popstate', this.readHash);
        this.readHash();
    }

    readHash() {
        var guid = parseInt(window.location.hash.replace("#",""));
        this.openFolder(guid);
    }

    getItems() {
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

    getTree() {
        $.get('/pleiofile/folder_tree?container_guid=' + this.props.homeGuid, function(result) {
            this.setState({
                folderTree: result
            });
        }.bind(this));
    }

    openFolder(guid) {
        if (guid) {
            this.state.folderGuid = guid;
            window.location.hash = guid;
        } else {
            window.location.hash = '';
            this.state.folderGuid = this.props.homeGuid;
        }

        this.getItems();
    }

    sort(on, ascending) {
        if (on == this.state.sortOn) {
            var ascending = !this.state.sortAscending;
        } else {
            var ascending = true;
        }

        var compare = function(a, b) {
            // a dir is always sorted on top
            if (a.is_dir && !b.is_dir) {
                return -1;
            } else if (!a.is_dir && b.is_dir) {
                return 1;
            }

            if (a[on] !== undefined) {
                var aCmp = a[on].toLowerCase();
            } else {
                var aCmp = 0;
            }

            if (b[on] !== undefined) {
                var bCmp = b[on].toLowerCase();
            } else {
                var bCmp = 0;
            }

            if (aCmp < bCmp) {
                if (ascending) {
                    return -1;
                } else {
                    return 1;
                }
            }
            if (aCmp > bCmp) {
                if (ascending) {
                    return 1;
                } else {
                    return -1;
                }
            }

            if (on !== 'title') {
                if (a.title < b.title) {
                    return -1;
                }

                if (a.title > b.title) {
                    return 1;
                }
            }

            return 0;
        };

        this.setState({
            items: this.state.items.sort(compare),
            sortOn: on,
            sortAscending: ascending
        });
    }

    render() {
        var breadcrumb = this.state.breadcrumb.map(function(crumb) {
            return (
                <BreadcrumbItem key={crumb.guid} guid={crumb.guid} title={crumb.title} onOpenFolder={this.openFolder} />
            );
        }.bind(this));

        var home = ( <BreadcrumbItem key="0" path={this.props.home} title="Home" onOpenFolder={this.openFolder} /> );
        breadcrumb.unshift(home);

        if (_appData['odt_enabled']) {
            var create_odt = (
                <MenuItem onClick={this.newFile}>{elgg.echo('pleiofile:create_file')}</MenuItem>
            )
        }

        if (this.state.isWritable) {
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
                <FileList items={this.state.items} onComplete={this.getItems} onOpenFolder={this.openFolder} onEditFile={this.editFile} onEditFolder={this.editFolder} onSort={this.sort} sortOn={this.state.sortOn} sortAscending={this.state.sortAscending} />
                <FileUpload ref="fileUpload" folderGuid={this.state.folderGuid} onComplete={this.getItems} />
                <FolderEdit ref="folderEdit" folderTree={this.state.folderTree} parentGuid={this.state.folderGuid} onComplete={this.getItems} folder={this.state.editFolder} defaultAccessId={this.state.accessId} />
                <FileEdit ref="fileEdit" folderTree={this.state.folderTree} parentGuid={this.state.folderGuid} onComplete={this.getItems} file={this.state.editFile} />
            </div>
        );
    }

    newFile() {
        var location = '/odt_editor/create/' + this.props.homeGuid;
        if (this.props.homeGuid !== this.state.folderGuid) {
            location += '?folder_guid=' + this.state.folderGuid;
        }
        window.location = location;
    }

    uploadFile() {
        this.refs['fileUpload'].setAccessId(this.state.accessId);
        this.refs['fileUpload'].open();
    }

    editFile(file) {
        this.refs['fileEdit'].setFile(file);
        this.refs['fileEdit'].open();
    }

    createFolder() {
        this.refs['folderEdit'].setFolder({
            title: '',
            access_id: this.state.accessId
        });
        this.refs['folderEdit'].open();
    }

    editFolder(folder) {
        this.refs['folderEdit'].setFolder(folder);
        this.refs['folderEdit'].open();
    }
}

export default FileBrowser;
