import React,{Component,Proptypes} from  'react'
import {bindActionCreators,combineReducers } from  'redux'
import {steps,gifts} from '../StaticResource/navBarTitle'
import {connect} from "react-redux"
import {addGift,addticket,subGift,changeName} from "../action/actions"
import ExchangeTip  from "./cExchangeTips.jsx"
function validatePrimeNumber(number) {
    if (number === 11) {
        return {
            validateStatus: 'success',
            errorMsg: null,
        };
    }
    return {
        validateStatus: 'error',
        errorMsg: 'The prime between 8 and 12 is 11!',
    };
}


class cExchange extends Component {

    constructor(props) {
        super(props);
        this.state = {
            number: {
                value: 11,
            },
        };

    }

    handleNumberChange = (value) => {
        this.setState({
            number: {
                ...validatePrimeNumber(value),
                value,
            },
        });
    }

    render() {
        const number = this.state.number;
        const tips = 'A prime is a natural number greater than 1 that has no positive divisors other than 1 and itself.';
        let { dispatch } = this.props;
        return (
            <ExchangeTip onClick={this.handleNumberChange.bind(this)}>
            </ExchangeTip>
        );
    }

}


function mapStateToProps(states) {
    return {
        coins: state.wealth.coins,
        tickets: state.wealth.tickets,
        gifts: state.wealth.gifts,
        username: state.info.username
    }
}

function mapDispatchToProps(dispatch) {
    return {
        todoWea: bindActionCreators({
            addGift, addticket, subGift
        }, dispatch),
        todoInfo: bindActionCreators({
            changeName
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(cExchange);
