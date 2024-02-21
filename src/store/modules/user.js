// 和用户相关的状态管理

import { createSlice } from '@reduxjs/toolkit'
import { setToken as _setToken, getToken, removeToken } from '@/utils'
import { loginAPI, getProfileAPI } from '@/apis/user'

const userStore = createSlice({
  name: "user",
  // 数据状态
  initialState: {
    token: getToken() || '',
    userInfo: {},
    loginForm: {
      gonghao: '',
      password: '',
    },
  },
  // 同步修改方法
  reducers: {
    setToken (state, action) {
      state.token = action.payload
      _setToken(action.payload)
    },
    setUserInfo (state, action) {
      state.userInfo = action.payload
    },
    clearUserInfo (state) {
      state.token = ''
      state.userInfo = {}
      removeToken()
    },
    setLoginForm(state, action) {
      state.loginForm = action.payload
    },
  }
})


// 解构出actionCreater

const { setLoginForm,setToken, setUserInfo, clearUserInfo } = userStore.actions

// 获取reducer函数

const userReducer = userStore.reducer

// 登录获取token异步方法封装
const fetchLogin = (loginForm) => {
  return async (dispatch) => {
    try {
      const res = await loginAPI(loginForm)
      dispatch(setToken(res.data.token))
      return res // 返回响应对象以供后续处理
    } catch (error) {
      // 登录失败的处理逻辑
      throw new Error('登录失败：用户名或密码不正确') // 抛出错误以供捕获
    }
  }
}

// 获取个人用户信息异步方法
const fetchUserInfo = (loginForm) => {
  return async (dispatch) => {
    try {
      const res = await getProfileAPI(loginForm);
      if (res.data !== null && typeof res.data === 'object' && 'name' in res.data) {
        dispatch(setUserInfo(res.data));
        localStorage.setItem('user', JSON.stringify(res.data));
      } else {
        console.error('Response data is null or does not contain "name" property.');
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
};



export { fetchLogin, fetchUserInfo, clearUserInfo ,setLoginForm}

export default userReducer
