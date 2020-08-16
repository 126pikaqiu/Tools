import React from 'react';
import { Table, Button, Popconfirm, Checkbox, Tooltip, message } from 'antd';
import { Select } from 'antd';
import { SearchOutlined, QuestionCircleFilled } from '@ant-design/icons';
const { Option } = Select;

class MatchRuleTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 表格的行数据
            tableDataSource: [],
            // 提供的匹配规则
            matchRules: ['完全相等', '忽略大小写', '子串包含'],
            // 表格行数，删除行不减
            tableRowCount: 0,

            // 表格中添加的匹配规则行
            tableRowRules: {},

            needArtificial: false,

        };
    }

    // 删除
    handleDelete = (key) => {
        // 表格匹配规则行删除指定行
        if(this.state.tableRowRules[key]){
            delete this.state.tableRowRules[key];
        }
        // 表格行数据过滤
        const dataSource = this.state.tableDataSource;
        this.setState({ tableDataSource: dataSource.filter(item => item.key !== key) });
    };

    // 下拉框发生改变
    onChange = (value) =>{
        const rule = value.split('_').map(item=>(parseInt(item)));
        // 第多少行，删除行行数不减少
        let rowIndex = rule[0];

        // 一行中第几个下拉框
        let selectIndex = rule[1];

        // 选择的选项
        let option = rule[2];

        const { tableRowRules } = this.state;
        if(!tableRowRules[rowIndex]){
            tableRowRules[rowIndex] = [-1, -1, -1];
        }
        tableRowRules[rowIndex][selectIndex] = option;
        this.setState({tableRowRules})
    };

    selectChoice = (options, placeholder, rowIndex, selectIndex) =>{
        return (
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder={placeholder}
                optionFilterProp="children"
                onChange={this.onChange}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {
                    options.map((item,index)=>(<Option value={`${rowIndex}_${selectIndex}_${index}`} key={index}>{item}</Option>))
                }
            </Select>
        )
    };

    handleAdd = () => {
        const { tableRowCount, tableDataSource, matchRules } = this.state;
        const { tableHeaders } = this.props;
        const newData = {
            key: tableRowCount,
            f1: this.selectChoice(tableHeaders[0],'选择表头字段', tableRowCount, 0),
            f2: this.selectChoice(tableHeaders[1],'选择表头字段', tableRowCount, 1),
            rule: this.selectChoice(matchRules,'选择匹配方法', tableRowCount, 2),
        };
        this.setState({
            tableDataSource: [...tableDataSource, newData],
            tableRowCount: tableRowCount + 1
        });
    };

    onSearchMatch = ()=>{
        const { tableRowRules, needArtificial } = this.state;
        let rowIndexes = Object.keys(tableRowRules);
        for(let index = 0; index < rowIndexes.length; index++){
            if(tableRowRules[rowIndexes[index]][0] === -1 || tableRowRules[rowIndexes[index]][1] === -1 || tableRowRules[rowIndexes[index]][2] === -1){
                message.error(`第${index + 1}条匹配规则不全`);
                return;
            }
        }
        this.searchMatch(Object.values(tableRowRules), needArtificial);
    };

    searchMatch = (rules, needArtificial) => {
        const { excels, finishMatching, tableHeaders } = this.props;
        let successMatchTuple = [];

        let key1s = rules.map(item=>(tableHeaders[0][item[0]]));
        let key2s = rules.map(item=>(tableHeaders[1][item[1]]));
        let matchRules = rules.map(item=>(item[2]));
        for(let index = 0; index < excels[0].length; index++){
            let item1 = excels[0][index];
            for(let i = 0; i < excels[1].length; i++){
                let item2 = excels[1][i];
                let matchSuccess = true;
                for(let j = 0; j < key1s.length; j++){
                    let key1 = key1s[j];
                    let key2 = key2s[j];
                    let matchRule = matchRules[j];
                    if(!this.match(item1[key1],item2[key2],matchRule)){
                        matchSuccess = false;
                        break;
                    }
                }
                if(matchSuccess){
                    successMatchTuple.push([index,i]);
                    break;
                }
            }

        }

        // 先获得成功匹配的表1行索引序列，再获得
        let successMatchIndex = successMatchTuple.map(item=>(item[0]));
        let errorMatchIndex = [...new Array(excels[0].length).keys()].filter(item=>(successMatchIndex.indexOf(item) === -1));

        // 判断是否进行人工辅助匹配
        // if(needArtificial && errorMatchIndex.length > 0){
        //     const similarChoice = this.findSimilarChoice(errorMatchIndex, rules);
        //     message.success(`开始人工辅助，请回答下列${similarChoice.length}个问题！`);
        // } else {
        //     finishMatching(successMatchTuple, errorMatchIndex);
        // }
        finishMatching(successMatchTuple, errorMatchIndex);
    };

    findSimilarChoice(errorMatchIndex, rules){
        const similarities = [];
        const { tableHeaders, excels } = this.props;
        rules.forEach(rule=>{
            let key1 = tableHeaders[0][rule[0]];
            let key2 = tableHeaders[1][rule[1]];
            let sourceKey = excels.map(item=>(item[key2]));
            let temp = [];
            errorMatchIndex.forEach(item=>{
                let searchValue = excels[0][item][key1];
                temp.push(sourceKey.map((value)=>{
                    return this.similar(value, searchValue);
                }));
            });
            similarities.push(temp);
        });
        let orderedSimilarChoice = similarities
            .reduce((prev,next) => (prev.map((item,index)=>(item.map((value,i)=>(parseFloat(value) + parseFloat(next[index][i]))))))) // 所有规则加和
            .map(item=>(item.map((value,index)=>({index,value})).sort((a,b)=>(b.value - a.value))));  // 构造对象数组
        orderedSimilarChoice.forEach(item=>{item.splice(4, item.length - 4 >= 0?(item.length - 4):0)}); // 取前四位最高的
        return orderedSimilarChoice
    }


    // 判断值在目标集合中是否存在匹配项，type为匹配方法，目前支持0完全相等，1忽略大小写，2公共子串
    match(value, target, type){
        switch (type) {
            case 0:
                return value === target;
            case 1:
                return value.trim().toLowerCase() === target.trim().toLowerCase();
            case 2:
                return value.trim().toLowerCase().indexOf(target.trim().toLowerCase()) !== -1 ||
                    target.trim().toLowerCase().indexOf(value.trim().toLowerCase()) !== -1;
            default:
                return value === target;
        }
    }

    // 计算两个字符串的相似度，计算方法为最长公共子串
    similar(s, t) {
        if (!s || !t) {
            return 0
        }
        let l = s.length > t.length ? s.length : t.length;
        let n = s.length;
        let m = t.length;
        let d = [];
        let min = function(a, b, c) {
            return a < b ? (a < c ? a : c) : (b < c ? b : c)
        };
        let i, j, si, tj, cost;
        for (i = 0; i <= n; i++) {
            d[i] = [];
            d[i][0] = i
        }
        for (j = 0; j <= m; j++) {
            d[0][j] = j
        }
        for (i = 1; i <= n; i++) {
            si = s.charAt(i - 1);
            for (j = 1; j <= m; j++) {
                tj = t.charAt(j - 1);
                if (si === tj) {
                    cost = 0
                } else {
                    cost = 1
                }
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
            }
        }
        let res = (1 - d[n][m] / l);
        return res.toFixed(3);
    }

    // 是否勾选人工辅助选项
    checkboxOnChange = (e)=>{
        this.setState({ needArtificial: e.target.checked });
    };

    render() {
        const { filenames } = this.props;
        let columns = [
            {
                title: `${filenames[0]}`,
                dataIndex: 'f1',
                width: '30%'
            },
            {
                title: `${filenames[1]}`,
                dataIndex: 'f2',
                width: '30%'
            },
            {
                title: '匹配规则',
                dataIndex: 'rule',
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (_, record)=>
                    this.state.tableDataSource.length >= 1 ? (
                        <Popconfirm title="确定删除该规则?" onConfirm={() => this.handleDelete(record.key)}>
                            <a>删除</a>
                        </Popconfirm>
                    ) : null,
            },
        ];
        const { tableDataSource } = this.state;
        return (
            <div>
                <Button onClick={this.handleAdd} style={{ marginBottom: 16 }}>
                    添加一条规则
                </Button>
                <Table
                    bordered
                    dataSource={tableDataSource}
                    columns={columns}
                    title={() => '匹配规则设置'}
                />
                <Button type="primary" onClick={this.onSearchMatch} style={{marginTop: 15, marginRight:15}}>
                    <SearchOutlined/>
                    开始匹配
                </Button>
                <span>  <Checkbox onChange={this.checkboxOnChange} checked={this.state.needArtificial}>人工辅助 </Checkbox>
                    <Tooltip title="对于无法匹配的选项，采用最长公共子串的方式计算相似度，提供4个选项供人工判断。目前暂未实现。">
                        <QuestionCircleFilled />
                    </Tooltip> &nbsp;</span>
            </div>
        );
    }
}

export default MatchRuleTable;
