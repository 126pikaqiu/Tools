import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import routes from "@/router";
import { Route, Switch, BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            {
                routes.map((route,index) => (
                    <Route
                        key={index}
                        path={route.path}
                        exact
                        render={props => {
                            let prefix = route.title || "开发者页面";
                            document.title = `${prefix} - 小工具箱`;
                            return <route.component {...props}></route.component>
                        }}

                    />
                ))
            }
        </Switch>
    </BrowserRouter>
    ,
  document.getElementById('root')
);


