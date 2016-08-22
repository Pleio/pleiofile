import React from 'react';
import moment from 'moment';

let clickOnLink = false;

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.openFolder = this.openFolder.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    openFolder(e) {
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

    render() {
        var cssClass = this.props.selected ? 'active' : '';
        var readAccess = _appData['accessIds'][this.props.item['accessId']];

        if (this.props.item['writeAccessId'] === 0) {
            var writeAccess = this.props.item.createdByName;
        } else {
            var writeAccess = _appData['accessIds'][this.props.item['writeAccessId']];
        }

        if (this.props.item['subtype'] === "folder") {
            if (!_appData['isWidget']) {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                        <td>
                            <a href="javascript:void(0);" onMouseDown={this.onLinkMouseDown} onClick={this.openFolder}>
                                <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>-</td>
                        <td>{readAccess}</td>
                        <td>{writeAccess}</td>
                    </tr>
                );
            } else {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                        <td>
                            <a href="javascript:void(0);" onMouseDown={this.onLinkMouseDown} onClick={this.openFolder}>
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
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                        <td>
                            <a href={this.props.item.url}>
                                <span className="glyphicon glyphicon-file"></span>&nbsp;
                                {this.props.item.title}
                            </a>
                        </td>
                        <td>{modifiedAt}</td>
                        <td>{readAccess}</td>
                        <td>{writeAccess}</td>
                    </tr>
                );
            } else {
                return (
                    <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
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
