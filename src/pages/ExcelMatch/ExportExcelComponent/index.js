import React from "react";
import { Modal, Select, Button } from 'antd';

const { Option } = Select;


class ExportExcelComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            exportKeys:[]
        }
    }
    handleChange =  (value) =>{
        this.state.exportKeys = value
    };

    onExport = () =>{
        const { onOk } = this.props;
        const { exportKeys } = this.state;
        onOk(exportKeys);
    };

    render() {
        const { exportModelVisible, tableHeaders, onCancel } = this.props;
        let choice = [];
        let keys = [];
        let defaultValue = [];

        if(exportModelVisible){
            tableHeaders[0].forEach(item=>{
                let key = item + "&_0";
                while(keys.indexOf(key) !== -1){
                    key = key.split("&_")[0] + (parseInt(key.split("&_")[1]) + 1)
                }
                keys.push(key);
                // 默认添加第一张表的所有字段
                defaultValue.push(`1&_${key}`);
                choice.push({key:`1&_${key}`, value:`t1.${item}`});
            });
            tableHeaders[1].forEach(item=>{
                let key = item + "&_0";
                while(keys.indexOf(key) !== -1){
                    key = key.split("&_")[0] + (parseInt(key.split("&_")[1]) + 1)
                }
                keys.push(key);
                choice.push({key:`2&_${key}`, value:`t2.${item}`});
            });
            this.state.exportKeys = [...defaultValue];
        }

        return <div>
            {
                exportModelVisible &&
                <Modal
                    title="导出字段设置"
                    visible={true}
                    onCancel={onCancel}
                    footer={[
                        <Button type="primary"  onClick={this.onExport}>
                            确认导出
                        </Button>,
                        <Button
                            onClick={onCancel}>
                            取消
                        </Button>,
                    ]}
                >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="设置需要导出的字段"
                        onChange={this.handleChange}
                        defaultValue={defaultValue}
                    >
                        {choice.map(item=>(<Option key={item.key}>{item.value}</Option>))}
                    </Select>
                </Modal>
            }

        </div>

    }
}

export default ExportExcelComponent;
