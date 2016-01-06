import React from 'react';

class BreadcrumbItem extends React.Component {
    constructor(props) {
        super(props);
        this.onOpenFolder = this.onOpenFolder.bind(this);
    }

    onOpenFolder() {
        this.props.onOpenFolder(this.props.guid);
    }

    render() {
        return (
            <li>
                <a href="javascript:void(0);" onClick={this.onOpenFolder}>
                    {this.props.title}
                </a>
            </li>
        )
    }
}

export default BreadcrumbItem;
