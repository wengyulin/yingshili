import React,{Component} from 'react'

export default class Menu extends Component {

    constructor(props, context) {
        super(props);
    }

    render() {
        return (<a href={this.props.path} style={{

        fontWeight:"24px"

        }}>{this.props.title}</a>);
    }

}