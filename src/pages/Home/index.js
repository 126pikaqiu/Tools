import React from "react";
import { Card, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import './index.less';
const { Meta } = Card;

class Home extends React.Component{
    render() {
        return (
            <div className="page">
                <div className="site-card-wrapper">
                    <Row gutter={16}>
                        <Col span={4}>
                            <Card
                                hoverable
                                style={{ width: 240 }}
                                cover={<img alt="表格匹配" src='https://www.pikachu.today/pictures/tools/homeCardImg/tableMatch.jpg' />}
                            >

                                <Meta
                                    title={
                                    <Link to="/tableMatch" style={{color:'black'}}>
                                        <div>表格匹配</div>
                                    </Link>
                                    }
                                    description="一个小巧的表格匹配工具" />
                            </Card>
                        </Col>

                    </Row>
                </div>
                <div className="footer">
                    <div>
                        蜀ICP备20016616号-1 <br/>
                        ©小工具箱 2019-2020
                    </div>
                </div>
            </div>

        )
    }
}

export default Home;
