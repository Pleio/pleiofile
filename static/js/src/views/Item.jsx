import React from 'react';
import moment from 'moment';

let clickOnLink = false;

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.onOpenFolder = this.onOpenFolder.bind(this);
        this.onToggleSelect = this.onToggleSelect.bind(this);
        this.getAccessLabel = this.getAccessLabel.bind(this);
    }

    onToggleSelect(e) {
        this.props.onToggleSelect(this.props.item, e.target.checked);
    }

    onOpenFolder(e) {
        this.props.onOpenFolder(this.props.item.guid);
    }

    onLinkMouseDown(e) {
        clickOnLink = true;
    }

    getAccessLabel(accessId) {
        if (accessId === 0) {
            return this.props.item.createdByName;
        } else {
            if (_appData['accessIds'][accessId]) {
                return _appData['accessIds'][accessId];
            } else {
                return elgg.echo('access:limited:label');
            }
        }
    }

    render() {
        var cssClass = this.props.selected ? 'active' : '';

        if (this.props.item['subtype'] === "folder") {
            if (!_appData['isWidget']) {
                return (
                    <tr className={cssClass}>
                        <td><input type="checkbox" className="pleiofile-check" name={`select-${this.props.item.guid}`} onChange={this.onToggleSelect} checked={this.props.selected} /></td>
                        <td>
                            <a href="javascript:void(0);" onMouseDown={this.onLinkMouseDown} onClick={this.onOpenFolder}>
                                <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>-</td>
                        <td>{this.getAccessLabel(this.props.item.accessId)}</td>
                        <td>{this.getAccessLabel(this.props.item.writeAccessId)}</td>
                        <td></td>
                    </tr>
                );
            } else {
                return (
                    <tr className={cssClass}>
                        <td>
                            <a href="javascript:void(0);" onMouseDown={this.onLinkMouseDown} onClick={this.onOpenFolder}>
                                <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>-</td>
                    </tr>
                );
            }
        } else {
            let modifiedAt = moment(this.props.item['timeUpdated']).format("DD-MM-YY HH:mm");

            let comments
            if (this.props.item.commentsCount > 0) {
                comments = (
                    <a href={`/file/view/${this.props.item.guid}`}>
                        <span className="glyphicon glyphicon-comment"></span>&nbsp;{this.props.item.commentsCount}
                    </a>
                )
            }

            if (!_appData['isWidget']) {
                return (
                    <tr className={cssClass}>
                        <td><input type="checkbox" className="pleiofile-check" name={`select-${this.props.item.guid}`} onChange={this.onToggleSelect} checked={this.props.selected} /></td>
                        <td>
                            <a href={this.props.item.url}>
                                <span className="glyphicon glyphicon-file"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>{modifiedAt}</td>
                        <td>{this.getAccessLabel(this.props.item.accessId)}</td>
                        <td>{this.getAccessLabel(this.props.item.writeAccessId)}</td>
                        <td>{comments}</td>
                    </tr>
                );
            } else {
                return (
                    <tr className={cssClass}>
                        <td>
                            <a href={this.props.item.url}>
                                <span className="glyphicon glyphicon-file"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>{modifiedAt}</td>
                    </tr>
                );
            }
        }
    }
}

export default Item;
