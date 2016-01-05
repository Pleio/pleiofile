var React = require('react');
var ReactDOM = require('react-dom');
var Button = require('react-bootstrap').Button;
var DropdownButton = require('react-bootstrap').DropdownButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Modal = require('react-bootstrap').Modal;
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;
var Breadcrumb = require('react-bootstrap').Breadcrumb;
var BreadcrumbItem = require('react-bootstrap').BreadcrumbItem;
var Set = require('immutable').Set;
var OrderedSet = require('immutable').OrderedSet;
var moment = require('moment');

var FileList = React.createClass({
    getInitialState: function() {
        return {
            selected: new OrderedSet(),
            shiftKey: false,
            selecting: false,
            selectBegin: null,
            selectEnd: null
        };
    },
    componentDidMount: function() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("mouseup", this.onMouseUp);

        // clear selection when clicking outside list
        $('html').mousedown(function(e) {
            var table = document.getElementById('pleiobox-table');
            if (!$.contains(table, e.target) && !$('body').hasClass('modal-open')) {
                this.setState({
                    selected: new OrderedSet()
                });
            }
        }.bind(this));
    },
    componentWillUpdate: function(nextProps, nextState) {
        // do not select site text when selecting elements
        if (nextState.selecting) {
            $('html').disableSelection();
        } else {
            $('html').enableSelection();
        }

        // clear selection when changing folders
        if (nextProps.items !== this.items) {
            this.state.selected = new OrderedSet();
        }

        if (nextState.selecting) {
            var seq = this.props.items.toIndexedSeq();
            var beginIndex = seq.findIndex(v => v == nextState.selectBegin);
            var endIndex = seq.findIndex(v => v == nextState.selectEnd);

            if (beginIndex < endIndex) {
                nextState.selected = this.props.items.slice(beginIndex, endIndex + 1);
            } else {
                nextState.selected = this.props.items.slice(endIndex, beginIndex + 1);
            }
        }
    },
    onKeyDown: function(e) {
        if (e.shiftKey) {
            this.setState({
                shiftKey: true
            });
        }
    },
    onKeyUp: function(e) {
        if (this.state.shiftKey) {
            this.setState({
                shiftKey: false
            });
        }
    },
    onMouseDown: function(e, item) {
        this.setState({
            selecting: true,
            selectBegin: item,
            selectEnd: item
        });
    },
    onMouseOver: function(e, item) {
        if (this.state.selecting) {
            this.setState({
                selectEnd: item
            });
        }
    },
    onMouseUp: function(e, item) {
        if (this.state.selecting) {
            this.setState({
                selecting: false,
                selectEnd: item
            });
        }
    },
    sort: function(on) {
        this.props.onSort(on);
    },
    view: function() {
        window.location = '/file/view/' + this.state.selected.first().guid;
    },
    download: function() {
        window.location = this.state.selected.first().url;
    },
    bulkDownload: function() {
        var selectedFiles = $.map(this.state.selected.filter(v => v.is_dir === false).toArray(), function(o) { return o.guid });
        var selectedFolders = $.map(this.state.selected.filter(v => v.is_dir === true).toArray(), function(o) { return o.guid });

        window.location = '/pleiofile/bulk_download?' + $.param({
            file_guids: selectedFiles,
            folder_guids: selectedFolders
        });
    },
    editItem: function(e) {
        if (this.state.selected.size !== 1) {
            return true;
        }

        var selectedItem = this.state.selected.first();
        if (selectedItem['is_dir']) {
            this.props.onEditFolder(selectedItem);
        } else {
            this.props.onEditFile(selectedItem);
        }
    },
    deleteItems: function() {
        var total = this.state.selected.size;
        this.state.selected.map(function(item) {
            $jq19.ajax({
                method: 'POST',
                url: '/' + elgg.security.addToken("action/pleiofile/delete"),
                data: {
                    guid: item.guid
                },
                success: function(data) {
                    total -= 1;
                    if (total === 0) {
                        this.state.selected = new OrderedSet();
                        this.props.onComplete();
                    }
                }.bind(this)
            });
        }.bind(this));
    },
    onOpenFolder: function(guid) {
        this.props.onOpenFolder(guid);
    },
    render: function() {
        var items = this.props.items.map(function(item) {
            return (<Item
                key={item.guid}
                item={item}
                selected={this.state.selected.has(item)}
                onMouseDown={this.onMouseDown}
                onMouseOver={this.onMouseOver}
                onMouseUp={this.onMouseUp}
                onOpenFolder={this.onOpenFolder} />);
        }.bind(this));

        if (this.state.selected.size == 1) {
            if (this.state.selected.first().is_dir) {
                var download = (
                    <span>
                        <span className="glyphicon glyphicon-download-alt"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.bulkDownload}>{elgg.echo('pleiofile:download')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                );
            } else {
                var download = (
                    <span>
                        <span className="glyphicon glyphicon-download-alt"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.download}>{elgg.echo('pleiofile:download')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                );
                var view = (
                    <span>
                        <span className="glyphicon glyphicon-eye-open"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.view}>{elgg.echo('pleiofile:view')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                );
            }
        } else {
            var download = (
                <span>
                    <span className="glyphicon glyphicon-download-alt"></span>&nbsp;
                        <a href="javascript:void(0);" onClick={this.bulkDownload}>{elgg.echo('pleiofile:download')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            );
        }

        var view = (
            <span>
                {download}
                {view}
            </span>
        );

        var isWritable = true;
        this.state.selected.map(function(item) {
            if (!item.is_writable) { isWritable = false; }
        });

        if (isWritable) {
            if (this.state.selected.size == 1) {
                var edit = (
                    <span>
                        <span className="glyphicon glyphicon-edit"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.editItem}>{elgg.echo('edit')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="glyphicon glyphicon-trash"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.deleteItems}>{elgg.echo('delete')}</a>&nbsp;
                    </span>
                );
            } else {
                var edit = (
                    <span>
                        <span className="glyphicon glyphicon-trash"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.deleteItems}>{elgg.echo('delete')}</a>&nbsp;
                    </span>
                );
            }
        }

        if (this.state.selected.size === 0) {
            var columns = {
                'title': elgg.echo('pleiofile:name'),
                'time_updated': elgg.echo('pleiofile:modified_at'),
                'created_by': elgg.echo('pleiofile:created_by'),
                'access_id': elgg.echo('pleiofile:shared_with')
            };

            var header = $jq19.map(columns, function(value, key) {
                if (this.props.sortOn === key) {
                    if (this.props.sortAscending) {
                        var glyphicon = "glyphicon-chevron-down";
                    } else {
                        var glyphicon = "glyphicon-chevron-up";
                    }
                } else {
                    var glyphicon = "";
                }

                return (
                    <th key={key}>
                        <a href="javascript:void(0);" onClick={this.sort.bind(this, key)}>{value}</a>&nbsp;
                        <span className={"glyphicon " + glyphicon}></span>
                    </th>
                );
            }.bind(this));
        } else {
            if (this.state.selected.size == 1) {
                var message = elgg.echo('pleiofile:item_selected');
            } else {
                var message = elgg.echo('pleiofile:items_selected');
            }

            var header = (
                <th colSpan="4">
                    {this.state.selected.size} {message}&nbsp;&nbsp;
                    {view}
                    {edit}
                </th>
            );
        }

        return (
            <table id="pleiobox-table" className="table table-hover">
            <thead>
                <tr>
                    {header}
                </tr>
            </thead>
            <tbody>
                {items}
            </tbody>
            </table>
        );
    }
});

var Item = React.createClass({
    openFolder: function(e) {
        this.props.onOpenFolder(this.props.item.guid);
    },
    onMouseDown: function(e) {
        this.props.onMouseDown(e, this.props.item);
    },
    onMouseOver: function(e) {
        this.props.onMouseOver(e, this.props.item);
    },
    onMouseUp: function(e) {
        this.props.onMouseUp(e, this.props.item);
    },
    render: function() {
        var cssClass = this.props.selected ? 'active' : '';
        var sharedWith = _appData['accessIds'][this.props.item['access_id']];

        if (this.props.item['is_dir']) {
            return (
                <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                    <td>
                        <a href="javascript:void(0);" onClick={this.openFolder}>
                            <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>-</td>
                    <td>{this.props.item.created_by}</td>
                    <td>{sharedWith}</td>
                </tr>
            );
        } else {
            var modified_at = moment(this.props.item['time_updated']).format("DD-MM-YY HH:mm");

            return (
                <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                    <td>
                        <a href={this.props.item.url}>
                            <span className="glyphicon glyphicon-file"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>{modified_at}</td>
                    <td>{this.props.item.created_by}</td>
                    <td>{sharedWith}</td>
                </tr>
            );
        }
    }
});

var FileUpload = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            uploading: 'waiting_for_input',
            files: [],
            succeeded: new Set(),
            failed: new Set(),
            accessId: null
        };
    },
    close() { this.setState({ showModal: false }); },
    open() {
        this.setState({
            showModal: true,
            uploading: 'waiting_for_input',
            files: [],
            succeeded: new Set(),
            failed: new Set()
        });
    },
    setAccessId(accessId) {
        this.setState({
            accessId: accessId
        });
    },
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
                <Modal show={this.state.showModal} onHide={this.close}>
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
                        <form onSubmit={this.upload}>
                            <Input type="file" multiple label={elgg.echo('pleiofile:files')} name="files" onChange={this.changeFiles} />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            {uploadButton}
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    },
    clickCloseButton(e) {
        e.preventDefault();
        this.close();
    },
    changeFiles(e) {
        this.setState({
            files: e.target.files,
            succeeded: new Set(),
            failed: new Set()
        });
    },
    changeAccessId(e) {
        this.setState({accessId: e.target.value});
    },
    upload(e) {
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
            data.append('parent_guid', this.props.folderGuid);

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
});

var FileEdit = React.createClass({
    getInitialState() {
        return {
            guid: false,
            showModal: false,
            title: '',
            accessId: false,
            parentGuid: this.props.parentGuid
        };
    },
    setFile: function(file) {
        this.setState({
            guid: file.guid,
            title: file.title,
            accessId: file.access_id,
            parentGuid: this.props.parentGuid
        });
    },
    close() { this.setState({ showModal: false }); },
    open() { this.setState({ showModal: true }); },
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
                            <FolderSelect folderTree={this.props.folderTree} folderGuid={0} parentGuid={this.state.parentGuid} onChange={this.changeParentGuid} />
                            <ButtonInput type="submit" bsStyle="primary" value={elgg.echo('edit')} />
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    },
    changeTitle(e) {
        this.setState({title: e.target.value});
    },
    changeAccessId(e) {
        this.setState({accessId: e.target.value});
    },
    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    },
    edit(e) {
        e.preventDefault();
        this.close();

        $jq19.ajax({
            url: '/' + elgg.security.addToken("action/pleiofile/update_file"),
            data: {
                guid: this.state.guid,
                title: this.state.title,
                access_id: this.state.accessId,
                parent_guid: this.state.parentGuid
            },
            type: 'POST',
            success: function(data) {
                this.props.onComplete();
            }.bind(this)
        });
    }
});

var FolderEdit = React.createClass({
    getInitialState() {
        return {
            guid: false,
            title:'',
            accessId: this.props.defaultAccessId,
            parentGuid: this.props.parentGuid,
            showModal: false
        };
    },
    setFolder: function(folder) {
        if (folder) {
            this.setState({
                guid: folder.guid,
                title: folder.title,
                accessId: folder.access_id,
                parentGuid: this.props.parentGuid
            });
        } else {
            this.setState(this.getInitialState());
        }
    },
    close() { this.setState({ showModal: false }); },
    open() { this.setState({ showModal: true }); },
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
                            <Input type="text" ref="title" label={elgg.echo('pleiofile:name')} value={this.state.title} onChange={this.changeTitle} autoFocus="true" />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            {folderSelect}
                            <ButtonInput type="submit" bsStyle="primary" value={buttonValue} />
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    },
    changeTitle(e) {
        this.setState({title: e.target.value});
    },
    changeAccessId(e) {
        this.setState({accessId: e.target.value});
    },
    changeParentGuid(e) {
        this.setState({parentGuid: e.target.value});
    },
    create(e) {
        e.preventDefault();
        this.close();

        if (this.state.guid) {
            var url = '/' + elgg.security.addToken("action/pleiofile/update_folder");
            var data = {
                'guid': this.state.guid,
                'title': this.state.title,
                'access_id': this.state.accessId,
                'parent_guid': this.state.parentGuid
            };
        } else {
            var url = '/' + elgg.security.addToken("action/pleiofile/create_folder");
            var data = {
                'parent_guid': this.props.parentGuid,
                'title': this.state.title,
                'access_id': this.state.accessId
            };
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
});

var FileBrowser = React.createClass({
    getInitialState: function() {
        return {
            folderGuid: this.props.homeGuid,
            folderTree: [],
            breadcrumb: [],
            items: new OrderedSet,
            sortOn: 'title',
            sortAscending: true,
            accessId: null,
            isWritable: false
        }
    },
    componentDidMount: function() {
        window.addEventListener('popstate', this.readHash);
        this.readHash();
    },
    readHash: function() {
        var guid = parseInt(window.location.hash.replace("#",""));
        this.openFolder(guid);
    },
    getItems: function() {
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
    },
    getTree: function() {
        $.get('/pleiofile/folder_tree?container_guid=' + this.props.homeGuid, function(result) {
            this.setState({
                folderTree: result
            });
        }.bind(this));
    },
    openFolder: function(guid) {
        if (guid) {
            this.state.folderGuid = guid;
            window.location.hash = guid;
        } else {
            window.location.hash = '';
            this.state.folderGuid = this.props.homeGuid;
        }

        this.getItems();
    },
    sort: function(on, ascending) {
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
    },
    render: function() {
        var breadcrumb = this.state.breadcrumb.map(function(crumb) {
            return (
                <BreadcrumbItem key={crumb.guid} guid={crumb.guid} title={crumb.title} onOpenFolder={this.openFolder} />
            );
        }.bind(this));

        var home = ( <BreadcrumbItem key="0" path={this.props.home} title="Home" onOpenFolder={this.openFolder} /> );
        breadcrumb.unshift(home);

        if (this.state.isWritable) {
            var add = (
                <div className="pleiobox-btn-group">
                    <DropdownButton id="new" title={elgg.echo('add')} pullRight={true}>
                        <MenuItem onClick={this.newFile}>{elgg.echo('pleiofile:create_file')}</MenuItem>
                        <MenuItem onClick={this.uploadFile}>{elgg.echo('pleiofile:upload_file')}</MenuItem>
                        <MenuItem onClick={this.createFolder}>{elgg.echo('pleiofile:create_folder')}</MenuItem>
                    </DropdownButton>
                </div>
            );
        }

        return (
            <div>
                <div className="pleiobox-breadcrumb">
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
    },
    newFile: function() {
        var location = '/odt_editor/create/' + this.props.homeGuid;
        if (this.props.homeGuid !== this.state.folderGuid) {
            location += '?folder_guid=' + this.state.folderGuid;
        }
        window.location = location;
    },
    uploadFile: function() {
        this.refs['fileUpload'].setAccessId(this.state.accessId);
        this.refs['fileUpload'].open();
    },
    editFile: function(file) {
        this.refs['fileEdit'].setFile(file);
        this.refs['fileEdit'].open();
    },
    createFolder: function() {
        this.refs['folderEdit'].setFolder({
            title: '',
            access_id: this.state.accessId
        });
        this.refs['folderEdit'].open();
    },
    editFolder: function(folder) {
        this.refs['folderEdit'].setFolder(folder);
        this.refs['folderEdit'].open();
    }
});

var FolderSelect = React.createClass({
    onChange: function(e) {
        this.props.onChange(e);
    },
    parseTree: function() {
        var tree = []
        var iterateTree = function(folder, prefix) {
            if (folder.guid === this.props.folderGuid) {
                return;
            }

            tree.push({
                guid: folder.guid,
                title: prefix + ' ' + folder.title
            });

            for (var i=0; i < folder.children.length; i++) {
                iterateTree(folder.children[i], prefix + '-');
            }
        }.bind(this);

        iterateTree(this.props.folderTree, '');
        return tree;
    },
    render: function() {
        var options = $.map(this.parseTree(), function(item) {
            return (
                <option key={item.guid} value={item.guid}>{item.title}</option>
            );
        }.bind(this));

        return (
            <Input type="select" ref="parentGuid" label={elgg.echo('pleiofile:parent_folder')} value={this.props.parentGuid} onChange={this.onChange}>
                {options}
            </Input>
        );
    },
});

var BreadcrumbItem = React.createClass({
    onOpenFolder: function() {
        this.props.onOpenFolder(this.props.guid);
    },
    render: function() {
        return (
            <li>
                <a href="javascript:void(0);" onClick={this.onOpenFolder}>
                    {this.props.title}
                </a>
            </li>
        )
    }
});

ReactDOM.render(
    <FileBrowser homeGuid={_appData['containerGuid']} />,
    document.getElementById('pleiobox')
);
