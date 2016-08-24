import React from 'react';
import $jq19 from 'jquery';
import { Input } from 'react-bootstrap';

export default class AccessSelect extends React.Component {
    render() {
        var accessOptions = $jq19.map(_appData['accessIds'], function(value, key) {
            return (<option key={key} value={key}>{value}</option>);
        });

        return (
            <Input type="select" ref={this.props.ref} label={this.props.label} value={this.props.value} onChange={this.props.onChange}>
                {accessOptions}
            </Input>
        )
    }

}
