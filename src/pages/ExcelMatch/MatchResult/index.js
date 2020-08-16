import React from "react";
import { Table, Button } from 'antd';

class MatchResult extends React.Component{

    render() {
        const { dataSource } = this.props;

        let columns = [
            {
                title: `匹配规则`,
                dataIndex: 'rule',
                width: '30%'
            },
            {
                title: `匹配成功条目`,
                dataIndex: 'success',
                width: '30%'
            },
            {
                title: '匹配失败条目',
                dataIndex: 'fail',
            },
            {
                title: '匹配成功率',
                dataIndex: 'percent'
            },
        ];
        return (
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                title={() => '匹配结果'}
            />
        )
    }
}

export default MatchResult;
