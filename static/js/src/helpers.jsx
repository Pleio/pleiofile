export function sortItems(items, sortOn, sortAscending) {
    var compare = function(a, b) {
        // a dir is always sorted on top
        if (a.subtype == "folder" && !b.subtype == "folder") {
            return -1;
        } else if (!a.subtype == "folder" && b.subtype == "folder") {
            return 1;
        }

        if (a[sortOn] !== undefined) {
            if (Number.isInteger(a[sortOn])) {
                var aCmp = a[sortOn];
            } else {
                var aCmp = a[sortOn].toLowerCase();
            }
        } else {
            var aCmp = 0;
        }

        if (b[sortOn] !== undefined) {
            if (Number.isInteger(b[sortOn])) {
                var bCmp = b[sortOn];
            } else {
                var bCmp = b[sortOn].toLowerCase();
            }
        } else {
            var bCmp = 0;
        }

        if (aCmp < bCmp) {
            if (sortAscending) {
                return -1;
            } else {
                return 1;
            }
        }
        if (aCmp > bCmp) {
            if (sortAscending) {
                return 1;
            } else {
                return -1;
            }
        }

        if (sortOn !== 'title') {
            if (a.title < b.title) {
                return -1;
            }

            if (a.title > b.title) {
                return 1;
            }
        }

        return 0;
    };

    return items.sort(compare);
}