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
}

export default Item;
