import React, { useEffect, useState } from 'react';
import {
    Button,
    Space,
    Table,
    Modal,
    Form,
    Input,
    Select,
    message,
    Checkbox,
    Upload,
    DatePicker,
    Pagination,
    Tag
} from 'antd';
import axios from 'axios';
import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import Search from 'antd/es/input/Search';

const { confirm } = Modal;
const { Option } = Select;
dayjs.locale('zh-cn');

const ReactCom = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/empLeave');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOk = async () => {
        try {
            let values = await form.validateFields();
            console.log('Form values:', values);

            if (editingRecord) {
                values.img = imageUrl;
                const response = await axios.put(
                    `http://127.0.0.1:8888/empLeave/update/${editingRecord.id}`,
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
                const response = await axios.post('http://127.0.0.1:8888/empLeave/save', {
                    ...values,
                    img: imageUrl,
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
            const response = await axios.delete(`http://127.0.0.1:8888/empLeave/delete/${recordId}`);

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

    async function handleSearch(value) {
        try {
            const response = await axios.get('http://127.0.0.1:8888/empLeave/getByCon', {
                params: { username: searchName || null },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <a>{text}</a>,
            width: '10%',
        },
        {
            title: '员工编号',
            dataIndex: 'employeeId',
            key: 'employeeId',
            width: '10%',
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            width: '15%',
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            width: '15%',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
        },
        {
            title: '原因',
            dataIndex: 'reason',
            key: 'reason',
            width: '15%',
        },
        {
            title: '审批状态',
            dataIndex: 'approvalStatus',
            key: 'approvalStatus',
            width: '10%',
        },
        {
            title: '审批人',
            dataIndex: 'approver',
            key: 'approver',
            width: '10%',
        },
        {
            title: '工号',
            dataIndex: 'gonghao',
            key: 'gonghao',
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
        form.setFieldsValue({ ...record });
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="输入用户名进行搜索"
                    onSearch={handleSearch}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ width: 200, marginRight: 10 }}
                />
            </div>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={showModal}>
                    添加
                </Button>
            </Space>
            <Table columns={columns} dataSource={data} />

            <Modal title="添加" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="编号" name="id">
                        <Input />
                    </Form.Item>
                    <Form.Item label="员工编号" name="employeeId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="开始时间" name="startTime">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="结束时间" name="endTime">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="类型" name="type">
                        <Input />
                    </Form.Item>
                    <Form.Item label="原因" name="reason">
                        <Input />
                    </Form.Item>
                    <Form.Item label="审批状态" name="approvalStatus">
                        <Input />
                    </Form.Item>
                    <Form.Item label="审批人" name="approver">
                        <Input />
                    </Form.Item>
                    <Form.Item label="工号" name="gonghao">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="修改" visible={isEditModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="编号" name="id">
                        <Input />
                    </Form.Item>
                    <Form.Item label="员工编号" name="employeeId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="开始时间" name="startTime">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="结束时间" name="endTime">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="类型" name="type">
                        <Input />
                    </Form.Item>
                    <Form.Item label="原因" name="reason">
                        <Input />
                    </Form.Item>
                    <Form.Item label="审批状态" name="approvalStatus">
                        <Input />
                    </Form.Item>
                    <Form.Item label="审批人" name="approver">
                        <Input />
                    </Form.Item>
                    <Form.Item label="工号" name="gonghao">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReactCom;
