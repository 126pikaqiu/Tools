import XLSX from 'xlsx';

export function importExcel(file,success=undefined, error=undefined){

    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
        try {
            const { result } = event.target;
            // 以二进制流方式读取得到整份excel表格对象
            const workbook = XLSX.read(result, { type: 'binary' });
            let data = []; // 存储获取到的数据
            // 遍历每张工作表进行读取（这里默认只读取第一张表）
            for (const sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    // 利用 sheet_to_json 方法将 excel 转成 json 数据
                    data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    break;
                }
            }
            success(data,files[0]);
        } catch (e) {
            // 这里可以抛出文件类型错误不正确的相关提示
            error(files[0]);
            return;
        }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);

}
export function exportExcel(headers, data, fileName = 'export.xlsx') {
    if(headers.length === 0 || data.length === 0){
        return
    }
    const _headers = headers
        .map((item, i) => Object.assign({}, { key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }), {});

    const _data = data
        .map((item, i) => headers.map((key, j) => Object.assign({}, { content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2) })))
        // 对刚才的结果进行降维处理（二维数组变成一维数组）
        .reduce((prev, next) => prev.concat(next))
        // 转换成 worksheet 需要的结构
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.content } }), {});

    // 合并 headers 和 data
    const output = Object.assign({}, _headers, _data);
    // 获取所有单元格的位置
    const outputPos = Object.keys(output);
    // 计算出范围 ,["A1",..., "H2"]
    const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

    // 构建 workbook 对象
    const wb = {
        SheetNames: ['mySheet'],
        Sheets: {
            mySheet: Object.assign(
                {},
                output,
                {
                    '!ref': ref,
                    '!cols': [{ wpx: 45 }, { wpx: 100 }, { wpx: 200 }, { wpx: 80 }, { wpx: 150 }, { wpx: 100 }, { wpx: 300 }, { wpx: 300 }],
                },
            ),
        },
    };
    var excelData = XLSX.write(wb, { bookType: "xlsx", bookSST: false, type: "binary" });
    var blob = new Blob([s2ab(excelData)], {type:"application/octet-stream"});
    saveAs(blob, fileName);
    console.log(blob)
}

function saveAs(url, filename) {
    if(typeof url == 'object' && url instanceof Blob)
    {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = filename; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

export function exportCsv(headers, rows, filename) {
    if (Array.isArray(headers) && headers.length > 0) { //表头信息不能为空
        if (!filename || typeof filename != "string") {
            filename = "export.csv"
        }
        let blob = getCsvBlob(headers, rows);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            let url = URL.createObjectURL(blob);
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }
    }
}

function getCsvBlob(headers, rows) {
    const BOM = '\uFEFF';
    let columnDelimiter = ','; //默认列分隔符','
    let rowDelimiter = '\r\n'; //默认行分隔符 '\r\n'
    let csv = headers.reduce((previous, header) => {
        return (previous ? previous + columnDelimiter : '') + (header.title || header.column);
    }, '');
    if (Array.isArray(rows) && rows.length > 0) {
        let columns = headers.map(header => header.column);
        csv = rows.reduce((previous, row) => {
            let rowCsv = columns.reduce((pre, column) => {
                if (row.hasOwnProperty(column)) {
                    let cell = row[column];
                    if (cell != null) {
                        let header = headers.find(item => item.column == column);
                        if (header.formatter != null && typeof (header.formatter) == "function") {
                            cell = header.formatter(cell);
                        }
                        if (cell != null) {
                            cell = cell.toString().replace(new RegExp(rowDelimiter, 'g'), ' '); // 若数据中本来就含行分隔符，则用' '替换
                            cell = new RegExp(columnDelimiter).test(cell) ? `"${cell}"` : cell; //若数据中本来就含列分隔符，则用""包起来
                            return pre ? pre + columnDelimiter + cell : pre + cell;
                        }
                    }
                    return pre ? pre + columnDelimiter : pre + " ";//reduce初始值为''，故第一次迭代时不会在行首加列分隔符。后面的遇到值为空或不存在的列要填充含空格的空白" ",则pre返回true，会加列分隔符
                }
                else {
                    return pre ? pre + columnDelimiter : pre + " ";//即使不存在该列也要填充空白，避免数据和表头错位不对应
                }
            }, '');
            return previous + rowDelimiter + rowCsv;
        }, csv);
    }
    let blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    return blob;
}
