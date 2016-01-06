import React from 'react';
import { OrderedSet } from 'immutable';
import Item from './Item';

class FileList extends React.Component {
    constructor(props) {
        super(props);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.sort = this.sort.bind(this);
        this.view = this.view.bind(this);
        this.download = this.download.bind(this);
        this.bulkDownload = this.bulkDownload.bind(this);
        this.editItem = this.editItem.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
        this.onOpenFolder = this.onOpenFolder.bind(this);

        this.state = {
            selected: new OrderedSet(),
            shiftKey: false,
            selecting: false,
            selectBegin: null,
            selectEnd: null
        };
    }

    componentDidMount() {
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
    }

    componentWillUpdate(nextProps, nextState) {
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
    }

    onKeyDown(e) {
        if (e.shiftKey) {
            this.setState({
                shiftKey: true
            });
        }
    }

    onKeyUp(e) {
        if (this.state.shiftKey) {
            this.setState({
                shiftKey: false
            });
        }
    }

    onMouseDown(e, item) {
        this.setState({
            selecting: true,
            selectBegin: item,
            selectEnd: item
        });
    }

    onMouseOver(e, item) {
        if (this.state.selecting) {
            this.setState({
                selectEnd: item
            });
        }
    }

    onMouseUp(e, item) {
        if (this.state.selecting) {
            this.setState({
                selecting: false,
                selectEnd: item
            });
        }
    }

    sort(on) {
        this.props.onSort(on);
    }

    view() {
        window.location = '/file/view/' + this.state.selected.first().guid;
    }

    download() {
        window.location = this.state.selected.first().url;
    }

    bulkDownload() {
        var selectedFiles = $.map(this.state.selected.filter(v => v.is_dir === false).toArray(), function(o) { return o.guid });
        var selectedFolders = $.map(this.state.selected.filter(v => v.is_dir === true).toArray(), function(o) { return o.guid });

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
        if (selectedItem['is_dir']) {
            this.props.onEditFolder(selectedItem);
        } else {
            this.props.onEditFile(selectedItem);
        }
    }

    deleteItems() {
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
}

export default FileList;