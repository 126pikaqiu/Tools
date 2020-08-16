import React, {Component} from 'react';
import {Button, message, Modal, Tooltip} from 'antd';
import { DownSquareOutlined, QuestionCircleFilled, UploadOutlined } from '@ant-design/icons';
import { importExcel, exportCsv } from '../../utils/excelUtil'
import MatchRuleTable from "./MatchRule";
import MatchResult from "./MatchResult";
import ExportExcelComponent from "./ExportExcelComponent";
import styles from './index.less'

class ExcelMatch extends Component {
    constructor() {
        super();
        this.state = {
            filenames: ["未选中", "未选中"],
            tableHeaders: [[],[]],
            excels: [[],[]],

            questionModelVisible: false,
            exportModelVisible: false,
            alreadyMatched: false,

            // 成功匹配的索引组 [[index1,index2],[index3,index4],...]
            successMatchTuple: [],

            // 未匹配表1索引序列 [index5,index6,index7,...]
            errorMatchIndex: []
        }
    }

    onImportExcel = (file, type) => {
        // 获取上传的文件对象
        let _ = this;
        importExcel(file, (data, file)=>{
            const excels = _.state.excels;
            const filenames = _.state.filenames;
            const tableHeaders = _.state.tableHeaders;
            excels[type - 1] = data;
            filenames[type - 1] = file.name;
            tableHeaders[type - 1] = Object.keys(data[0]);
            _.setState({ excels, filenames, tableHeaders });
            message.success(`文件"${file.name}"上传成功！`);
        }, (file)=>{
            message.error(`文件"${file.name}"格式不正确！`);
        });
    };

    file1Upload = file => {
        this.onImportExcel(file,1);
    };

    file2Upload = file => {
        this.onImportExcel(file,2);
    };

    finishMatching = (successMatchTuple, errorMatchIndex ) => {
        this.setState({successMatchTuple, errorMatchIndex, alreadyMatched: true})
    };


    questionAndAnswer = (similarChoice) => {
        this.setState({questionModelVisible: true, })
    };



    onExportMatchResult = () =>{
        this.setState({exportModelVisible:true});
    };

    closeExportExcel = () =>{
        this.setState({exportModelVisible:false})
    };

    exportMatchResult = (exportKeys)=>{
        const { successMatchTuple, excels } = this.state;
        const headers = [];
        exportKeys.forEach(item=>{
            let splits = item.split('&_');
            let title = splits[1];
            if(parseInt(splits[2]) > 0){
                title += splits[2];
            }
            headers.push({title, column:item})
        });
        const data = [];
        successMatchTuple.forEach((match,index)=>{
            let temp = {};
            exportKeys.forEach(item=>{
                let splits = item.split('&_');
                let key = splits[1];
                let table = parseInt(splits[0]) - 1;
                let index = match[table];
                temp[item] = excels[table][index][key];
            });
            data.push(temp)
        });
        exportCsv(headers, data, '匹配结果.csv');
        this.setState({exportModelVisible:false})
    };

    onExportNoMatch = () =>{
        const finalFailedIndex = this.state.errorMatchIndex;
        const headers = this.state.tableHeaders[0].map(item=>({title:item,column:item}));
        const data = [];
        finalFailedIndex.forEach(itemIndex=>{
            data.push(this.state.excels[0][itemIndex])
        });
        exportCsv(headers, data, '未匹配条目.csv')
    };



    render() {
        const { filenames, tableHeaders, excels, alreadyMatched, questionModelVisible, exportModelVisible } = this.state;
        const len = excels[0].length;

        const dataSource = [ { rule:`机器匹配`, success: this.state.successMatchTuple.length,  fail: this.state.errorMatchIndex.length,
            percent: (this.state.successMatchTuple.length / len * 100).toFixed(1) + '%', key: 1 }];

        let div = <>
            <div className='container'>
                <Modal
                    title="人工辅助匹配"
                    visible={questionModelVisible}
                    okText="确定"
                    cancelText="结束"
                >
                    <p>下面哪个选项与最相似</p>
                </Modal>

                <ExportExcelComponent exportModelVisible={exportModelVisible}
                                      tableHeaders={tableHeaders}
                                      onCancel={this.closeExportExcel.bind(this)}
                                      onOk={this.exportMatchResult.bind(this)}/>

                <p className='upload-tip'>支持 .xlsx、.xls 格式的文件</p>
                <div className='row'>
                    <strong>被匹配文件 </strong>
                    <Tooltip title="取值范围一般是匹配文件范围的子集">
                        <QuestionCircleFilled />
                    </Tooltip> &nbsp;
                    <Button className='upload-wrap'>
                        <UploadOutlined/>
                        <input className='file-uploader' type='file' accept='.xlsx, .xls' onChange={this.file1Upload}/>
                        <span className='upload-text'>上传文件</span>
                    </Button>
                    <span> {filenames[0]}</span>
                </div>
                <div className='row'>
                    <strong> &nbsp;&nbsp;&nbsp;&nbsp;匹配文件 </strong>
                    <Tooltip title="取值范围一般是被匹配文件范围的父集">
                        <QuestionCircleFilled />
                    </Tooltip> &nbsp;
                    <Button className='upload-wrap'>
                        <UploadOutlined/>
                        <input className='file-uploader' type='file' accept='.xlsx, .xls' onChange={this.file2Upload}/>
                        <span className='upload-text'>上传文件</span>
                    </Button>
                    <span> {filenames[1]}</span>
                </div>
                {
                // 如果没有选中两个文件就不展示
                tableHeaders[0].length > 0 && tableHeaders[1].length > 0 &&
                    <div>
                        <div className='row'>
                            <MatchRuleTable filenames={filenames} tableHeaders={tableHeaders} excels={excels} finishMatching={this.finishMatching.bind(this)}/>
                        </div>
                    </div>
                }
                {
                    alreadyMatched &&
                        <div>
                            <MatchResult dataSource={dataSource}/>
                            <div className='row'>
                                <Button type="primary" onClick={this.onExportMatchResult}>
                                    <DownSquareOutlined/>
                                    导出结果
                                </Button>
                                &nbsp;
                                <Button type="primary" onClick={this.onExportNoMatch} >
                                    <DownSquareOutlined/>
                                    导出未匹配条目
                                </Button>
                            </div>
                        </div>
                }
            </div>
        </>;
        return div;
    }
}
export default ExcelMatch;
