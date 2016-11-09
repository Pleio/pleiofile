import React from 'react';
import moment from 'moment';

let clickOnLink = false;

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.onOpenFolder = this.onOpenFolder.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.getAccessLabel = this.getAccessLabel.bind(this);
    }

    onOpenFolder(e) {
        this.props.onOpenFolder(this.props.item.guid);
    }

    onLinkMouseDown(e) {
        clickOnLink = true;
    }

    onMouseDown(e) {
        if (!clickOnLink) {
            this.props.onMouseDown(e, this.props.item);
        }
    }

    onMouseOver(e) {
        this.props.onMouseOver(e, this.props.item);
    }

    onMouseUp(e) {
        clickOnLink = false;
        this.props.onMouseUp(e, this.props.item);
    }

    onTouchStart(e) {
        this.props.onTouchStart(e, this.props.item);
    }

    onTouchEnd(e) {
        this.props.onTouchEnd(e, this.props.item);
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
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} className={cssClass}>
                        <td>
                            <a href="javascript:void(0);" onMouseDown={this.onLinkMouseDown} onClick={this.onOpenFolder}>
                                <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>-</td>
                        <td>{this.getAccessLabel(this.props.item.accessId)}</td>
                        <td>{this.getAccessLabel(this.props.item.writeAccessId)}</td>
                    </tr>
                );
            } else {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} className={cssClass}>
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

            if (!_appData['isWidget']) {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} className={cssClass}>
                        <td>
                            <a href={this.props.item.url}>
                                <span className="glyphicon glyphicon-file"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>{modifiedAt}</td>
                        <td>{this.getAccessLabel(this.props.item.accessId)}</td>
                        <td>{this.getAccessLabel(this.props.item.writeAccessId)}</td>
                    </tr>
                );
            } else {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} className={cssClass}>
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
