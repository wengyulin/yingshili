import React,{Component} from 'react'
import Menu from './menu.jsx'

const navLists = [
    {
        title: "首页",
        path: "/home",
        key: "shouye"
    }, {
        title: "首页",
        path: "#",
        key: "shouye1"
    }
];


export default class Nav extends Component {
    constructor(props, context) {
        super(props);
    }

    render() {
        return (
            <div className={"menu-box"}>
                <div className={"menu-nav"}>
                    {navLists.map((item) => {
                        return (<Menu key={item.key} path={item.path} title={item.title}/>);
                    })}
                </div>
                <div className={"menu-content"}>
                    {this.props.childen}</div>
            </div>
        );
    }
}

