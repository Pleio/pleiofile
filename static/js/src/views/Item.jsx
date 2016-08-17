import React from 'react';
import moment from 'moment';

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

    onMouseDown(e) {
        this.props.onMouseDown(e, this.props.item);
    }
    onMouseOver(e) {
        this.props.onMouseOver(e, this.props.item);
    }

    onMouseUp(e) {
        this.props.onMouseUp(e, this.props.item);
    }

    render() {
        var cssClass = this.props.selected ? 'active' : '';
        var sharedWith = _appData['accessIds'][this.props.item['accessId']];

        if (this.props.item['subtype'] === "folder") {
            return (
                <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                    <td>
                        <a href="javascript:void(0);" onClick={this.openFolder}>
                            <span className="glyphicon glyphicon-folder-close"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>-</td>
                    <td>{this.props.item.createdByName}</td>
                    <td>{sharedWith}</td>
                </tr>
            );
        } else {
            let modifiedAt = moment(this.props.item['timeUpdated']).format("DD-MM-YY HH:mm");

            return (
                <tr onMouseDown={this.onMouseDown} onMouseOver={this.onMouseOver} onMouseUp={this.onMouseUp} className={cssClass}>
                    <td>
                        <a href={this.props.item.url}>
                            <span className="glyphicon glyphicon-file"></span>&nbsp;
                            {this.props.item.title}
                        </a>
                    </td>
                    <td>{modifiedAt}</td>
                    <td>{this.props.item.createdBy}</td>
                    <td>{sharedWith}</td>
                </tr>
            );
        }
    }
}

export default Item;
