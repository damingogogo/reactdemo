import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Modal, Form, Input, message, Checkbox, Upload } from 'antd';
import axios from 'axios';
import { InboxOutlined } from '@ant-design/icons';

const ReactCom = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    //加载table数据
    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/react/get');
            console.log(response);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [

        {
            title: '选择',
            dataIndex: 'selection',
            key: 'selection',
            render: (_, record) => (
                <Checkbox onChange={() => handleCheckboxChange(record.id)} />
            ),
            width: '5%',
        },
        {
            title: '编号',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <a>{text}</a>,
            width: '10%',
        },
        {
            title: '名称',
            dataIndex: 'username',
            key: 'username',
            render: (text) => <a>{text}</a>,
            width: '10%',
        },
        {
            title: '密码',
            dataIndex: 'password',
            key: 'password',
            width: '10%',
        },
        {
            title: '生日',
            dataIndex: 'birth',
            key: 'birth',
            width: '20%',
        },
        {
            title: '性别',
            key: 'sex',
            dataIndex: 'sex',
            width: '10%',
        },
        {
            title: '头像',
            dataIndex: 'img',
            key: 'img',
            render: (_, record) => {

                return <img src={record.img} alt="avatar" style={{ width: '50px', height: '50px' }} />;
            },
        },

        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => showEditModal(record)}>修改</a>
                    <a onClick={() => showDeleteConfirm(record.id)}>删除</a>
                </Space>
            ),
            width: '10%',
        },
    ];


    const [form] = Form.useForm(); // Create a form instance

    const showModal = () => {
        setIsModalVisible(true);
        setEditingRecord(null);
    };

    const showEditModal = (record) => {
        setIsEditModalVisible(true);
        setEditingRecord(record);
        form.setFieldsValue(record);
    };

    const handleCheckboxChange = (id) => {
        console.log(id)
    }

    const handleOk = async () => {
        try {
            let values = await form.validateFields();
            console.log('Form values:', values);

            // Determine whether to add or update based on editingRecord
            if (editingRecord) {
                values.img = imageUrl
                // Update existing record
                const response = await axios.put(`http://127.0.0.1:8888/react/update/${editingRecord.id}`, values);

                if (response.status === 200) {
                    // Successful response
                    setIsEditModalVisible(false);
                    form.resetFields();
                    fetchData(); // Fetch data again after successful update
                    message.success('修改成功');
                } else {
                    // Handle unexpected status codes
                    message.error('修改失败，服务器返回异常状态码');
                }
            } else {
                // Add new record
                const response = await axios.post('http://127.0.0.1:8888/react/save', {
                    ...values, // Spread the existing values
                    img: imageUrl, // Update the 'img' field with the 'imageUrl' state
                });

                if (response.status === 200) {
                    // Successful response
                    setIsModalVisible(false);
                    form.resetFields(); // Reset the form fields after successful submission
                    fetchData(); // Fetch data again after successful form submission
                    message.success('添加成功');
                    setImageUrl(null)
                } else {
                    // Handle unexpected status codes
                    message.error('添加失败，服务器返回异常状态码');
                }
            }
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
            // You can customize this based on your validation error handling
            message.error('表单验证失败');
        }
    };

    //删除
    const showDeleteConfirm = (recordId) => {
        Modal.confirm({
            title: '确认删除',
            content: '是否确认删除该记录？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => handleDelete(recordId),
        });
    };

    const handleDelete = async (recordId) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8888/react/delete/${recordId}`);

            if (response.status === 200) {
                // Successful response
                fetchData(); // Fetch data again after successful deletion
                message.success('删除成功');
            } else {
                // Handle unexpected status codes
                message.error('删除失败，服务器返回异常状态码');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            message.error('删除失败，发生错误');
        }
    };

    const handleCancel = () => {
        form.resetFields(); // Reset the form fields when the modal is canceled
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingRecord(null);
        setImageUrl(null)
    };


    const [imageUrl, setImageUrl] = useState(null);

    const beforeUpload = (file) => {
        // You can add additional checks if needed
        return true;
    };

    const handleImageChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败.`);
        }
    };

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const formData = new FormData();
            formData.append('img', file);

            const response = await axios.post('http://127.0.0.1:8888/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("response", response);

            if (response.data) {
                setImageUrl(response.data.downloadUrl); // Update the image URL in the state
                onSuccess();
            } else {
                onError();
                message.error('上传失败，请重试！');
            }
        } catch (error) {
            onError();
            message.error('上传失败，请重试！');
        }
    };

    // Rest of your component code

    return (
        <div>
            <Button type="primary" style={{ marginBottom: 16 }} onClick={showModal}>
                添加
            </Button>
            <Table columns={columns} dataSource={data} />

            <Modal title="添加" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="名称" name="username">
                        <Input />
                    </Form.Item>
                    <Form.Item label="密码" name="password">
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="生日" name="birth">
                        <Input />
                    </Form.Item>
                    <Form.Item label="性别" name="sex">
                        <Input />
                    </Form.Item>
                    <Form.Item label="头像" name="img">
                        <Upload
                            name="img"
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleImageChange}
                            customRequest={customRequest}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="avatar"
                                    style={{ width: '50px', height: '50px' }}
                                />
                            ) : (
                                <div>
                                    <InboxOutlined style={{ fontSize: '36px', color: '#999' }} />
                                    <div style={{ marginTop: 8 }}>点击上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>

            <Modal title="修改" visible={isEditModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="名称" name="username">
                        <Input />
                    </Form.Item>
                    <Form.Item label="密码" name="password">
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="生日" name="birth">
                        <Input />
                    </Form.Item>
                    <Form.Item label="性别" name="sex">
                        <Input />
                    </Form.Item>
                    <Form.Item label="头像" name="img">
                        <Upload
                            name="img"
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleImageChange}
                            customRequest={customRequest}
                        >
                            
                            {imageUrl || form.getFieldValue("img") ? (
                                (imageUrl ? (
                                    <img
                                    src={imageUrl}
                                    alt="avatar"
                                    style={{ width: '50px', height: '50px' }}
                                />
                                ) : (
                                    <img
                                    src={form.getFieldValue("img")}
                                    alt="avatar"
                                    style={{ width: '50px', height: '50px' }}
                                />
                                ))
                            ) : (
                                <div>
                                    <InboxOutlined style={{ fontSize: '36px', color: '#999' }} />
                                    <div style={{ marginTop: 8 }}>点击上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
};

export default ReactCom;
