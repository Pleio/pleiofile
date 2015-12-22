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
var moment = require('moment');

var FileList = React.createClass({
    getInitialState: function() {
        return {
            selected: new Set(),
            clickSelecting: false,
            dragSelecting: false
        };
    },
    componentDidMount: function() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);

        // also stop selecting outside the elements
        window.addEventListener("mouseup", this.onMouseUp);

        // clear selection when clicking outside list
        $('html').mousedown(function(e) {
            var table = document.getElementById('pleiobox-table');
            if (!$.contains(table, e.target) && !$('body').hasClass('modal-open')) {
                this.setState({
                    selected: new Set()
                });
            }
        }.bind(this));
    },
    handleKeyDown: function(e) {
        if (e.shiftKey) { this.setState({ clickSelecting: true }); }
    },
    handleKeyUp: function(e) {
        this.setState({ clickSelecting: false });
    },
    componentWillUpdate: function(nextProps, nextState) {
        // do not select site text when selecting elements
        if (nextState.clickSelecting | nextState.dragSelecting) {
            $('html').disableSelection();
        } else {
            $('html').enableSelection();
        }

        // clear selection when changing folders
        if (nextProps.items !== this.items) {
            this.state.selected = new Set();
        }
    },
    onMouseDown: function(e, item) {
        if (this.state.clickSelecting) {
            this.setState({
                selected: this.state.selected.has(item) ? this.state.selected.delete(item) : this.state.selected.add(item)
            });
        } else {
            this.setState({
                dragSelecting: true,
                selected: new Set().add(item)
            });
        }
    },
    onMouseOver: function(e, item) {
        if (this.state.dragSelecting) {
            this.setState({
                selected: this.state.selected.has(item) ? this.state.selected.delete(item) : this.state.selected.add(item)
            })
        }
    },
    onMouseUp: function(e, item) {
        this.setState({ dragSelecting: false });
    },
    sort: function(on) {
        this.props.onSort(on);
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
                        this.state.selected = new Set();
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
                <th colSpan="3">
                    {this.state.selected.size} {message}&nbsp;&nbsp;
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
            files: null,
            accessId: null
        };
    },
    close() { this.setState({ showModal: false }); },
    open() { this.setState({ showModal: true }); },
    setAccessId(accessId) {
        this.setState({
            accessId: accessId
        });
    },
    render() {
        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>{elgg.echo('pleiofile:upload_file')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.upload}>
                            <Input type="file" multiple label={elgg.echo('pleiofile:files')} name="files" onChange={this.changeFiles} />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            <ButtonInput type="submit" bsStyle="primary" value="Uploaden" />
                        </form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    },
    changeFiles(e) {
        this.setState({files: e.target.files});
    },
    changeAccessId(e) {
        this.setState({accessId: e.target.value});
    },
    upload(e) {
        e.preventDefault();

        var total = this.state.files.length;
        for (var i=0; i < this.state.files.length; i++) {

            var data = new FormData();
            data.append('file', this.state.files[i]);
            data.append('access_id', this.state.accessId);
            data.append('parent_guid', this.props.folderGuid);

            var options = {
                url: '/' + elgg.security.addToken("action/pleiofile/upload"),
                data: data,
                contentType: false,
                cache: false,
                processData: false,
                type: 'POST',
                success: function(data) {
                    total -= 1;
                    if (total === 0) {
                        this.props.onComplete();
                        this.close();
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
            accessId: false
        };
    },
    setFile: function(file) {
        this.setState({
            guid: file.guid,
            title: file.title,
            accessId: file.access_id
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
    edit(e) {
        e.preventDefault();
        this.close();

        $jq19.ajax({
            url: '/' + elgg.security.addToken("action/pleiofile/update_file"),
            data: {
                guid: this.state.guid,
                title: this.state.title,
                access_id: this.state.accessId
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
            showModal: false
        };
    },
    setFolder: function(folder) {
        if (folder) {
            this.setState({
                guid: folder.guid,
                title: folder.title,
                accessId: folder.access_id
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
    create(e) {
        e.preventDefault();
        this.close();

        if (this.state.guid) {
            var url = '/' + elgg.security.addToken("action/pleiofile/update_folder");
            var data = {
                'guid': this.state.guid,
                'title': this.state.title,
                'access_id': this.state.accessId
            };
        } else {
            var url = '/' + elgg.security.addToken("action/pleiofile/create_folder");
            var data = {
                'parent_guid': this.props.folderGuid,
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
            breadcrumb: [],
            items: [],
            sortOn: 'title',
            sortAscending: true,
            accessId: null,
            isWritable: false
        }
    },
    componentDidMount: function() {
        this.getItems();
    },
    getItems: function() {
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
                    items: data.children
                });
            }.bind(this)
        });
    },
    openFolder: function(guid) {
        if (guid) {
            this.state.folderGuid = guid;
        } else {
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
                <FolderEdit ref="folderEdit" folderGuid={this.state.folderGuid} onComplete={this.getItems} folder={this.state.editFolder} defaultAccessId={this.state.accessId} />
                <FileEdit ref="fileEdit" onComplete={this.getItems} file={this.state.editFile} />
            </div>
        );
    },
    newFile: function() {
        window.open('/odt_editor/create' + this.state.path, '_blank');
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
            path: null,
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