import React, { useEffect, useState } from 'react';
import {
    Button,
    Space,
    Table,
    Modal,
    Form,
    Input,
    message,
    Checkbox,
    Upload,
    DatePicker,
    Pagination,
    Select,
    Tag
} from 'antd';
import axios from 'axios';
import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import Search from 'antd/es/input/Search';

const CheckboxGroup = Checkbox.Group;
const plainOptions = ['吃饭', '睡觉', '看书'];
const { confirm } = Modal;
const { Option } = Select;
dayjs.locale('zh-cn');

const ReactCom = () => {
    const [checkedList, setCheckedList] = useState([]);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkAll, setCheckAll] = useState(false);
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [birth, setBirth] = useState(null);
    const [form] = Form.useForm();
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [imageUrl, setImageUrl] = useState(null);

//打印复选框勾选的值
    const handleChange = (values) => {
        setCheckedList(values)



    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/react/get');
            console.log(response);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCheckboxChange = (id) => {
        console.log(id)
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((selectedId) => selectedId !== id)
                : [...prevSelectedIds, id]

        );

    };

    const handelDelBatch = () => {
        confirm({
            title: '确定要批量删除所选记录吗？',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                axios
                    .delete(`http://127.0.0.1:8888/react/deleteBatch/${selectedIds.join(',')}`)
                    .then((response) => {
                        console.log('批量删除成功:', response.data);
                        fetchData();
                        message.success('批量删除成功！');
                    })
                    .catch((error) => {
                        console.error('批量删除失败:', error);
                        message.error('批量删除失败！');
                    });
            },
            onCancel() {
                console.log('取消批量删除');
            },
        });
    };

    const handleOk = async () => {
        try {
            let values = await form.validateFields();
            console.log('Form values:', values);

            if (editingRecord) {
                values.img = imageUrl;
                const response = await axios.put(
                    `http://127.0.0.1:8888/react/update/${editingRecord.id}`,
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
                const response = await axios.post('http://127.0.0.1:8888/react/save', {
                    ...values,
                    img: imageUrl,
                    aihao:JSON.stringify(checkedList)
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
            const response = await axios.delete(`http://127.0.0.1:8888/react/delete/${recordId}`);

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

            console.log('response', response);

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
            const response = await axios.get('http://127.0.0.1:8888/react/getByCon', {
                params: { username: searchName || null },
            });
            console.log(response);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

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
            render: (text) => {
                const date = new Date(text);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
            },
        },
        {
            title: '性别',
            key: 'sex',
            dataIndex: 'sex',
            width: '10%',
        },
        {
            title: '爱好',
            key: 'aihao',
            dataIndex: 'aihao',
            render: (aihao) => (
                <span>
            {aihao && aihao.includes('吃饭') && <Tag color="blue">吃饭</Tag>}
                    {aihao && aihao.includes('睡觉') && <Tag color="green">睡觉</Tag>}
                    {aihao && aihao.includes('看书') && <Tag color="orange">看书</Tag>}
        </span>
            ),
            width: '15%',
        },

        {
            title: '头像',
            dataIndex: 'img',
            key: 'img',
            render: (_, record) => (
                <img src={record.img} alt="avatar" style={{ width: '50px', height: '50px' }} />
            ),
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
        // 将生日字段转换为dayjs对象
        const birthday = record.birth ? dayjs(record.birth) : null;
        // 设置表单字段的值
        form.setFieldsValue({ ...record, birth: birthday });
        setCheckedList(record.aihao);
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
                <Button type="primary" onClick={handelDelBatch}>
                    批量删除
                </Button>
            </Space>
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
                        <DatePicker style={{ width: '100%' }}/>
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
                    <Form.Item label="爱好" name="aihao">
                        <Checkbox.Group options={plainOptions} value={checkedList} onChange={handleChange} />
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
                        <DatePicker style={{ width: '100%' }} locale={{ lang: { locale: 'zh-cn' } }} />
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
                            {imageUrl || form.getFieldValue('img') ? (
                                imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="avatar"
                                        style={{ width: '50px', height: '50px' }}
                                    />
                                ) : (
                                    <img
                                        src={form.getFieldValue('img')}
                                        alt="avatar"
                                        style={{ width: '50px', height: '50px' }}
                                    />
                                )
                            ) : (
                                <div>
                                    <InboxOutlined style={{ fontSize: '36px', color: '#999' }} />
                                    <div style={{ marginTop: 8 }}>点击上传</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                    <Form.Item label="爱好" name="aihao">
                        <Checkbox.Group options={plainOptions} value={checkedList} onChange={handleChange} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReactCom;
