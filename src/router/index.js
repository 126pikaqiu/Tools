import ExcelMatch from "@/pages/ExcelMatch";
import Home from "@/pages/Home";

const routes = [
    { path: '/', component: Home, navShow: true, title: '首页' },
    { path: '/tableMatch', component: ExcelMatch, navShow: true, title: '表格匹配' }
];

export default routes;
