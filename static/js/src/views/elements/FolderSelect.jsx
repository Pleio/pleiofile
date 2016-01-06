import React from 'react';
import { Input } from 'react-bootstrap';

class FolderSelect extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.parseTree = this.parseTree.bind(this);
    }

    onChange(e) {
        this.props.onChange(e);
    }

    parseTree() {
        var tree = []
        var iterateTree = function(folder, prefix) {
            if (folder.guid === this.props.folderGuid) {
                return;
            }

            tree.push({
                guid: folder.guid,
                title: prefix + ' ' + folder.title
            });

            for (var i=0; i < folder.children.length; i++) {
                iterateTree(folder.children[i], prefix + '-');
            }
        }.bind(this);

        iterateTree(this.props.folderTree, '');
        return tree;
    }

    render() {
        var options = $.map(this.parseTree(), function(item) {
            return (
                <option key={item.guid} value={item.guid}>{item.title}</option>
            );
        }.bind(this));

        return (
            <Input type="select" ref="parentGuid" label={elgg.echo('pleiofile:parent_folder')} value={this.props.parentGuid} onChange={this.onChange}>
                {options}
            </Input>
        );
    }
}

export default FolderSelect;
