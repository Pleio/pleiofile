import React from 'react';

export default class PaginationItem extends React.Component {
    render() {
        let className = "";
        if (this.props.isActive) {
            className = "active";
        }

        return (
            <li className={className}>
                <a href="javascript:void(0);" onClick={() => this.props.onOpenFolder(this.props.folderGuid, this.props.limit, (this.props.page-1)*this.props.limit)}>{this.props.page}</a>
            </li>
        )
    }
}