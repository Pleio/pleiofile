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
            selected: new Set()
        };
    },
    sort: function(on) {
        this.props.onSort(on);
    },
    deleteItems: function() {
        var total = this.props.selected.size;
        this.props.selected.map(function(item) {
            $jq19.ajax({
                method: 'POST',
                url: '/' + elgg.security.addToken("action/pleiofile/delete"),
                data: {
                    'path': item.path
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
    onOpenFolder: function(path) {
        this.clearSelected();
        this.props.onOpenFolder(path);
    },
    onDragStart: function(item) {
        this.setState({
            selected: this.state.selected.add(item)
        })
    },
    toggleItem: function(item) {
        this.setState({
            selected: this.state.selected.has(item) ? this.state.selected.delete(item) : this.state.selected.add(item)
        });
    },
    render: function() {
        var items = this.props.items.map(function(item) {
            return (<Item
                key={item.path}
                item={item}
                selected={this.state.selected.has(item)}
                onSelect={this.toggleItem}
                onDragStart={this.onDragStart}
                onOpenFolder={this.onOpenFolder} />);
        }.bind(this));

        if (this.state.selected.size > 0) {
            if (this.state.selected.size == 1) {
                var header = (
                    <th colSpan="3">
                        {this.state.selected.size} items geselecteerd.&nbsp;&nbsp;
                        <span className="glyphicon glyphicon-edit"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.editFiles}>{elgg.echo('edit')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="glyphicon glyphicon-trash"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.deleteItems}>{elgg.echo('delete')}</a>&nbsp;
                    </th>
                );
            } else {
                var header = (
                    <th colSpan="3">
                        {this.state.selected.size} items geselecteerd.&nbsp;&nbsp;
                        <span className="glyphicon glyphicon-trash"></span>&nbsp;
                            <a href="javascript:void(0);" onClick={this.deleteItems}>{elgg.echo('delete')}</a>&nbsp;
                    </th>
                );
            }
        } else {
            var columns = {
                'title': elgg.echo('pleiofile:name'),
                'time_updated': elgg.echo('pleiofile:modified_at'),
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
        }

        return (
            <table className="table table-hover">
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
        e.stopPropagation();
        this.props.onOpenFolder(this.props.item.path);
    },
    handleSelect: function() {
        this.props.onSelect(this.props.item);
    },
    handleDragStart: function() {
        this.props.onDragStart(this.props.item);
    },
    render: function() {
        var cssClass = this.props.selected ? 'active' : '';
        var sharedWith = _appData['accessIds'][this.props.item['access_id']];

        if (this.props.item['is_dir']) {
            return (
                <tr onClick={this.handleSelect} onDragStart={this.handleDragStart} className={cssClass}>
                    <td>
                        <a href="javascript:void(0);" onClick={this.openFolder}>
                            <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>-</td>
                    <td>{sharedWith}</td>
                </tr>
            );
        } else {
            var modified_at = moment(this.props.item['time_updated']).format("DD-MM-YY HH:mm");

            return (
                <tr onClick={this.handleSelect} className={cssClass}>
                    <td>
                        <a href={"/pleiofile/" + this.props.item.path}>
                            <span className="glyphicon glyphicon-file"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>{modified_at}</td>
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
            accessId: _appData['defaultAccessId']
        };
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
            data.append('path', this.props.path);

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

var FolderCreate = React.createClass({
    getInitialState() {
        return {
            showModal: false,
            title:'',
            accessId: _appData['defaultAccessId']
        };
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
                        <Modal.Title>{elgg.echo('pleiofile:create_folder')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.create}>
                            <Input type="text" ref="title" label={elgg.echo('pleiofile:name')} value={this.state.title} onChange={this.changeTitle} autoFocus="true" />
                            <Input type="select" ref="accessId" label={elgg.echo('access')} value={this.state.accessId} onChange={this.changeAccessId}>
                                {accessOptions}
                            </Input>
                            <ButtonInput type="submit" bsStyle="primary" value={elgg.echo('create')} />
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

        $jq19.ajax({
            method: 'POST',
            url: '/' + elgg.security.addToken("action/pleiofile/create_folder"),
            data: {
                'path': this.props.path,
                'title': this.state.title,
                'access_id': this.state.accessId
            },
            success: function(data) {
                this.setState({
                    'title':''
                });
                this.props.onComplete();
            }.bind(this)
        });
    }
});

var FileBrowser = React.createClass({
    getInitialState: function() {
        return {
            path: this.props.home,
            breadcrumb: [],
            items: [],
            selected: new Set(),
            sortOn: 'title',
            sortAscending: true
        }
    },
    componentDidMount: function() {
        this.getItems();
    },
    clearSelected: function() {
        this.setState({
            selected: this.state.selected.clear()
        });
    },
    getItems: function() {
        $jq19.ajax({
            url: '/pleiofile/browse/' + this.state.path,
            dataType: 'json',
            success: function(data) {
                this.setState({
                    breadcrumb: data.breadcrumb,
                    items: data.children
                });
            }.bind(this)
        });
    },
    openFolder: function(path) {
        this.state.path = path;
        this.getItems();
    },
    toHome: function() {
        this.state.path = this.props.home;
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
        var path = this.state.path;
        if (path[0] == '/') { path = path.slice(1); }
        if (path[-1] == '/') { path = path.slice(0, -1); }

        var breadPath = this.props.home;
        var breadcrumb = this.state.breadcrumb.map(function(crumb) {
            breadPath += "/" + crumb.guid;
            return (
                <BreadcrumbItem key={crumb.guid} path={breadPath} title={crumb.title} onOpenFolder={this.openFolder} />
            );
        }.bind(this));

        var home = ( <BreadcrumbItem key="0" path={this.props.home} title="Home" onOpenFolder={this.openFolder} /> );
        breadcrumb.unshift(home);

        return (
            <div>
                <div className="pleiobox-breadcrumb">
                    <Breadcrumb>
                        {breadcrumb}
                    </Breadcrumb>
                </div>
                <div className="pleiobox-btn-group">
                    <DropdownButton id="new" title={elgg.echo('add')} pullRight={true}>
                        <MenuItem onClick={this.fileNew}>{elgg.echo('pleiofile:create_file')}</MenuItem>
                        <MenuItem onClick={this.fileUpload}>{elgg.echo('pleiofile:upload_file')}</MenuItem>
                        <MenuItem onClick={this.folderCreate}>{elgg.echo('pleiofile:create_folder')}</MenuItem>
                    </DropdownButton>
                </div>
                <FileList items={this.state.items} selected={this.state.selected} onComplete={this.getItems} onOpenFolder={this.openFolder} onSort={this.sort} sortOn={this.state.sortOn} sortAscending={this.state.sortAscending} />
                <FileUpload ref="fileUpload" path={this.state.path} onComplete={this.getItems} />
                <FolderCreate ref="folderCreate" path={this.state.path} onComplete={this.getItems} />
            </div>
        );
    },
    fileNew: function() {
        window.open('/odt_editor/create' + this.state.path, '_blank');
    },
    fileUpload: function() {
        this.refs['fileUpload'].open();
    },
    folderCreate: function() {
        this.refs['folderCreate'].open();
    }
});

var BreadcrumbItem = React.createClass({
    onOpenFolder: function() {
        this.props.onOpenFolder(this.props.path);
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
    <FileBrowser home={'/' + _appData['containerGuid']} />,
    document.getElementById('pleiobox')
);