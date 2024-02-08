import './index.scss'
import { Card, Form, Input, Button, message } from 'antd'
import logo from '@/assets/logo.png'
import { useDispatch } from 'react-redux'
import { fetchLogin } from '@/store/modules/user'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const onFinish = async (values) => {
    try {
      console.log(values)
      // 触发异步action fetchLogin
      const response = await dispatch(fetchLogin(values))
      console.log(response)
      // 1. 跳转到首页
      navigate('/')
      // 2. 提示一下用户
      message.success('登录成功')
    } catch (error) {
      // 处理登录失败的情况
      console.error('登录失败:', error.message)
      // 提示登录失败
      message.error(error.message)
      // 重定向到登录页面
      navigate('/login')
    }
  }
  return (
    <div className="login">
      <Card className="login-container">
        <h2 className="login-logo">员工后台管理系统</h2>
        {/*<img className="login-logo" alt="" />*/}
        {/* 登录表单 */}
        <Form onFinish={onFinish} validateTrigger="onBlur">
          <Form.Item
            name="gonghao"
            // 多条校验逻辑 先校验第一条 第一条通过之后再校验第二条
            rules={[
              {
                required: true,
                message: '请输入员工工号',
              },

            ]}>
            <Input size="large" placeholder="请输入工号" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}>
            <Input size="large" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
