import React, { useState } from 'react';
import './AuthForm.css';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [pageMode, setPageMode] = useState('login');
  axios.defaults.baseURL = 'http://127.0.0.1:8080';
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const response = await axios.post('/user/login', {
        username: values.username,
        password: values.password,
      });
      const { status } = response.data;
      switch (status) {
        case 'success':
          alert('Login successful!');
          navigate('/dashboard');
          break;
        case 'password error':
          alert('Incorrect password');
          break;
        case 'username error':
          alert('Username not found');
          break;
        default:
          alert('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (values) => {
    try {
      const response = await axios.post('/user/register', {
        username: values.username,
        password: values.password,
      });
      const { status } = response.data;
      switch (status) {
        case 'success':
          alert('Registration successful!');
          setPageMode('login');
          break;
        case 'username has been used':
          alert('Username already exists');
          break;
        default:
          alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <fieldset className="auth-content">
          <legend className="legend">{pageMode === 'login' ? 'Login' : 'Register'}</legend>
          <Form
            name="auth-form"
            className="auth-form"
            initialValues={{ remember: true }}
            onFinish={pageMode === 'login' ? handleLogin : handleRegister}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder={pageMode === 'login' ? 'Username' : 'Register Username'}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder={pageMode === 'login' ? 'Password' : 'Register Password'}
              />
            </Form.Item>
            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a
                className="auth-form-action"
                onClick={() => setPageMode(pageMode === 'login' ? 'register' : 'login')}
              >
                {pageMode === 'login' ? 'Register' : 'Back to Login'}
              </a>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-form-button"
              >
                {pageMode === 'login' ? 'Log in' : 'Register'}
              </Button>
            </Form.Item>
          </Form>
        </fieldset>
      </div>
    </div>
  );
};

export default AuthForm;