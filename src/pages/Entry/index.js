import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Modal, Form, Input, message, Upload, DatePicker, Select } from 'antd';
import axios from 'axios';
import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const EmployeeEntryManagement = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/entry');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (recordId) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8888/entry/delete/${recordId}`);

            if (response.status === 200) {
                fetchData();
                message.success('删除成功');
            } else {
                message.error('删除失败，服务器返回异常状态码');
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            message.error('删除失败，发生错误');
        }
    };

    const handleOk = async () => {
        try {
            let values = await form.validateFields();
            console.log('Form values:', values);

            if (editingRecord) {
                values.img = imageUrl;
                const response = await axios.put(
                    `http://127.0.0.1:8888/entry/update/${editingRecord.id}`,
                    values
                );

                if (response.status === 200) {
                    setIsEditModalVisible(false);
                    form.resetFields();
                    fetchData();
                    message.success('修改成功');
                } else {
                    message.error('修改失败，服务器返回异常状态码');
                }
            } else {
                const response = await axios.post('http://127.0.0.1:8888/entry', {
                    ...values,
                    img: imageUrl
                });

                if (response.status === 200) {
                    setIsModalVisible(false);
                    form.resetFields();
                    fetchData();
                    message.success('添加成功');
                    setImageUrl(null);
                } else {
                    message.error('添加失败，服务器返回异常状态码');
                }
            }
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
            message.error('表单验证失败');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingRecord(null);
        setImageUrl(null);
    };

    const beforeUpload = (file) => {
        return true;
    };

    const handleImageChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 文件上传成功`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败.`);
        }
    };

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

    const customRequest = async ({ file, onSuccess, onError }) => {
        try {
            const formData = new FormData();
            formData.append('img', file);

            const response = await axios.post('http://127.0.0.1:8888/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                setImageUrl(response.data.downloadUrl);
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

    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
        },
        {
            title: '员工编号',
            dataIndex: 'empId',
            key: 'emp_id',
            width: '10%',
        },
        {
            title: '状态',
            dataIndex: 'states',
            key: 'states',
            width: '10%',
        },
        {
            title: '入职时间',
            dataIndex: 'entryTime',
            key: 'entry_time',
            width: '10%',
        },
        {
            title: '审批人',
            dataIndex: 'approver',
            key: 'approver',
            width: '10%',
        },
        {
            title: '岗位编号',
            dataIndex: 'postId',
            key: 'postId',
            width: '10%',
        },
        {
            title: '部门编号',
            dataIndex: 'deptId',
            key: 'deptId',
            width: '10%',
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

    const showModal = () => {
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setIsEditModalVisible(true);
        setEditingRecord(record);
        form.setFieldsValue(record);
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={showModal}>
                    添加入职
                </Button>
            </Space>
            <Table columns={columns} dataSource={data} />

            <Modal title="添加入职" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="员工编号" name="empId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="状态" name="states">
                        <Input />
                    </Form.Item>
                    <Form.Item label="入职时间" name="entryTime">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item label="审批人" name="approver">
                        <Input />
                    </Form.Item>
                    <Form.Item label="岗位编号" name="postId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="部门编号" name="deptId">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="修改入职" visible={isEditModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="员工编号" name="empId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="状态" name="states">
                        <Input />
                    </Form.Item>
                    <Form.Item label="入职时间" name="entryTime">
                        <DatePicker />
                    </Form.Item>
                    <Form.Item label="审批人" name="approver">
                        <Input />
                    </Form.Item>
                    <Form.Item label="岗位编号" name="postId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="部门编号" name="deptId">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeEntryManagement;
