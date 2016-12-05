import React,{Component,Proptypes} from  'react'
import {Form , InputNumber } from 'antd'
const FormItem = Form.Item;
export default class ExchangeTip extends Component {

    render() {
        <Form horizontal>
            <FormItem
                {...formItemLayout}
                label="Prime between 8 & 12"
                validateStatus={number.validateStatus}
                help={number.errorMsg || tips}
            >
                <InputNumber
                    min={8}
                    max={12}
                    value={number.value}
                    onChange={this.handleNumberChange}
                />
            </FormItem>
        </Form>
    }

}
