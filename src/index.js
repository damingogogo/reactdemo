import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { Provider } from 'react-redux'
import store from './store'



import 'normalize.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// 在某个全局文件中定义 API 地址常量
export const BASEURL = 'http://127.0.0.1:8888';



const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(

    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>

)


