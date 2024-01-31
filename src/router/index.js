// 路由配置

import Layout from '@/pages/Layout' // src/pages/layout
import Login from '@/pages/Login'

import { createBrowserRouter } from 'react-router-dom'
import { AuthRoute } from '@/components/AuthRoute'
// import Home from '@/pages/Home'
// import Article from '@/pages/Article'
// import Publish from '@/pages/Publish'
import { Suspense, lazy } from 'react'




// 1. lazy函数对组件进行导入
const Home = lazy(() => import('@/pages/Home'))
const Article = lazy(() => import('@/pages/Article'))
const Publish = lazy(() => import('@/pages/Publish'))
const React = lazy(() => import('@/pages/React/index'))
const Employee = lazy(() => import('@/pages/Employee/index'))
const Contract = lazy(() => import('@/pages/Contract/index'))
const Found = lazy(() => import('@/pages/Found/index'))
const Daka = lazy(() => import('@/pages/Daka/index'))
const Qinjia = lazy(() => import('@/pages/Qinjia/index'))
const Entry = lazy(() => import('@/pages/Entry/index'))
// 配置路由实例

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRoute> <Layout /></AuthRoute>,
    children: [
      {
        index: true,
        element: <Suspense fallback={'加载中'}><Home /></Suspense>
      },
      {
        path: 'article',
        element: <Suspense fallback={'加载中'}><Article /></Suspense>
      },
      {
        path: 'publish',
        element: <Suspense fallback={'加载中'}><Publish /></Suspense>
      },
      {
        path: 'react',
        element: <Suspense fallback={'加载中'}><React /></Suspense>
      },
      {
        path: 'employee',
        element: <Suspense fallback={'加载中'}><Employee /></Suspense>
      },
      {
        path: 'entry',
        element: <Suspense fallback={'加载中'}><Entry /></Suspense>
      },
      {
        path: 'contract',
        element: <Suspense fallback={'加载中'}><Contract /></Suspense>
      },
      {
        path: 'found',
        element: <Suspense fallback={'加载中'}><Found /></Suspense>
      },
      {
        path: 'daka',
        element: <Suspense fallback={'加载中'}><Daka /></Suspense>
      },
      {
        path: 'qinjia',
        element: <Suspense fallback={'加载中'}><Qinjia /></Suspense>
      },

    ]
  },
  {
    path: "/login",
    element: <Login />
  }
])

export default router
