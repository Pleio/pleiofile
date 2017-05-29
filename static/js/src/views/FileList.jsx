import React from 'react';
import { OrderedSet } from 'immutable';
import Item from './Item';
import $jq19 from 'jquery';
import { connect } from 'react-redux';
import { changeSort, showModal, dropFiles } from '../actions';
import classnames from "classnames";

class FileList extends React.Component {
    constructor(props) {
        super(props);
        this.onSort = this.onSort.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.view = this.view.bind(this);
        this.download = this.download.bind(this);
        this.bulkDownload = this.bulkDownload.bind(this);
        this.editItem = this.editItem.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
        this.onOpenFolder = this.onOpenFolder.bind(this);
        this.onToggleSelect = this.onToggleSelect.bind(this);

        this.state = { selected: new OrderedSet() };
    }

    componentWillUpdate(nextProps, nextState) {
        // clear selection when changing folders
        if (nextProps.items !== this.props.items) {
            this.setState({ selected: new OrderedSet() });
        }
    }

    onToggleSelect(item, checked) {
        if (checked) {
            this.setState({ selected: this.state.selected.add(item) });
        } else {
            this.setState({ selected: this.state.selected.delete(item) });
        }
    }

    onSort(on) {
        if (on === this.props.folder.sortOn) {
            this.props.dispatch(changeSort(on, !this.props.folder.sortAscending));
        } else {
            this.props.dispatch(changeSort(on, true));
        }
    }

    onDragOver(e) {
        // here to prevent default browser behavior
        e.preventDefault();
    }

    onDrop(e) {
        e.preventDefault();
        let files = [];

        const dt = e.dataTransfer;
        if (dt.items) {
            for (var i=0; i < dt.items.length; i++) {
                if (dt.items[i].kind == "file" && dt.items[i].type !== "") {
                    files.push(dt.files[i]);
                }
            }
        } else {
            for (var i=0; i < dt.files.length; i++) {
                files.push(dt.files[i]);
            }
        }

        this.props.dispatch(dropFiles(files));
    }

    view() {
        window.location = '/file/view/' + this.state.selected.first().guid;
    }

    download() {
        window.location = this.state.selected.first().url;
    }

    bulkDownload() {
        var selectedFiles = $.map(this.state.selected.filter(v => v.subtype === "file").toArray(), function(o) { return o.guid });
        var selectedFolders = $.map(this.state.selected.filter(v => v.subtype === "folder").toArray(), function(o) { return o.guid });

        window.location = '/pleiofile/bulk_download?' + $.param({
            file_guids: selectedFiles,
            folder_guids: selectedFolders
        });
    }

    editItem(e) {
        if (this.state.selected.size !== 1) {
            return true;
        }

        var selectedItem = this.state.selected.first();
        if (selectedItem['subtype'] == "folder") {
            this.props.dispatch(showModal('folderEdit', selectedItem));
        } else {
            this.props.dispatch(showModal('fileEdit', selectedItem));
        }
    }

    deleteItems() {
        let result = confirm(elgg.echo("pleiofile:sure"));
        if (!result) {
            return;
        }

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
    }

    onOpenFolder(guid) {
        this.props.onOpenFolder(guid);
    }

    render() {
        var items = this.props.items.map(function(item) {
            return (<Item
                key={item.guid}
                item={item}
                selected={this.state.selected.has(item)}
                onToggleSelect={this.onToggleSelect}
                onOpenFolder={this.onOpenFolder} />);
        }.bind(this));

        if (this.state.selected.size == 1) {
            if (this.state.selected.first().subtype === "folder") {
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
                if (!_appData['isWidget']) {
                    var view = (
                        <span>
                            <span className="glyphicon glyphicon-eye-open"></span>&nbsp;
                                <a href="javascript:void(0);" onClick={this.view}>{elgg.echo('pleiofile:view')}</a>&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                    );
                }
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

        var canEdit = true;
        this.state.selected.map(function(item) {
            if (!item.canEdit) { canEdit = false; }
        });

        if (canEdit) {
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
            if (!_appData['isWidget']) {
                var columns = {
                    'sort': '',
                    'title': elgg.echo('pleiofile:name'),
                    'timeUpdated': elgg.echo('pleiofile:modified_at'),
                    'accessId': elgg.echo('pleiofile:shared_with'),
                    'writeAccessId': elgg.echo('pleiofile:write_access'),
                    'comments': ''
                };
            } else {
                var columns = {
                    'title': elgg.echo('pleiofile:name'),
                    'timeUpdated': elgg.echo('pleiofile:modified_at')
                };
            }

            var header = $jq19.map(columns, function(value, key) {
                if (this.props.folder.sortOn === key) {
                    if (this.props.folder.sortAscending) {
                        var glyphicon = "glyphicon-chevron-down";
                    } else {
                        var glyphicon = "glyphicon-chevron-up";
                    }
                } else {
                    var glyphicon = "";
                }

                return (
                    <th key={key}>
                        <a href="javascript:void(0);" onClick={this.onSort.bind(this, key)}>{value}</a>&nbsp;
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

            if (_appData['isWidget']) {
                var header = (
                    <th colSpan="6">
                        {view}
                        {edit}
                    </th>
                );
            } else {
                var header = (
                    <th colSpan="6">
                        {this.state.selected.size} {message}&nbsp;&nbsp;
                        {view}
                        {edit}
                    </th>
                );
            }
        }

        return (
            <div>
                <table id="pleiofile-table" className={classnames({"table table-hover": true, "selected": this.state.selected.size > 0})} onDragOver={this.onDragOver} onDrop={this.onDrop}>
                    <thead>
                        <tr>
                            {header}
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        folder: state.folder
    }
}

export default connect(mapStateToProps)(FileList);