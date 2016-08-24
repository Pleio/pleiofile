import React from 'react';
import PaginationItem from './PaginationItem';

export default class Pagination extends React.Component {
    render() {
        let total = this.props.total;
        let offset = this.props.offset;
        let limit = this.props.limit;

        let showPagination = false;
        if (total && total > limit) {
            showPagination = true;
        }

        if (!showPagination) {
            return (
                <nav aria-label="Page navigation"></nav>
            );
        }

        let totalPages = Math.ceil(total / limit);
        let currentPage = Math.floor(offset / limit) + 1;
        let firstPage = Math.max(currentPage - 2, 1);
        let lastPage = Math.min(currentPage + 2, totalPages);

        let pages = [];

        for (var i = firstPage; i <= lastPage; i++) {
            let isActive;
            if (i == currentPage) {
                isActive = true;
            }

            pages.push((
                <PaginationItem key={i} page={i} folderGuid={this.props.folderGuid} limit={limit} isActive={isActive} onOpenFolder={this.props.onOpenFolder} />
            ))
        }

        let backButton = "";
        let nextButton = "";

        if (currentPage > 1) {
            backButton = (
                <li>
                    <a href="javascript:void(0);" onClick={() => this.props.onOpenFolder(this.props.folderGuid, limit, offset - limit)} aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            );
        } else {
            backButton = (
                <li className="disabled">
                    <a href="javascript:void(0);" aria-label="Previous">
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
            );
        }

        if (currentPage < totalPages) {
            nextButton = (
                <li>
                    <a href="javascript:void(0);" onClick={() => this.props.onOpenFolder(this.props.folderGuid, limit, offset + limit)} aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            );
        } else {
            nextButton = (
                <li className="disabled">
                    <a href="javascript:void(0);" aria-label="Next">
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            );
        }

        return (
                <nav aria-label="Page navigation">
                    <div style={{textAlign:"center"}}>
                    <ul className="pagination">
                        {backButton}
                        {pages}
                        {nextButton}
                    </ul>
                    </div>
                </nav>
        )
    }
}