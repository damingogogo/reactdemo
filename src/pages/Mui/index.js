import React, { useEffect, useState } from 'react';
import {
    Button,
    Space,
    Table,
    Modal,
    Form,
    Input,
    message,
    Upload,
    DatePicker,
    Select,
    Radio,
    Tag,
    Checkbox,
    Cascader
} from 'antd';
import axios from 'axios';
import { InboxOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import Search from "antd/es/input/Search";
import './index.css'

const { Option } = Select;
const { confirm } = Modal;

const EmployeeEntryManagement = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);
    const [companys, setCompanys] = useState([]);
    const [fencompanys, setFencompanys] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedFencompany, setSelectedFencompany] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const { RangePicker } = DatePicker;
    const [searchName, setSearchName] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);





    useEffect(() => {
        if (selectedCompany !== null) {
            const fetchData = async () => {
                try {
                    const data = await fetchfencompanys(selectedCompany);
                    setFencompanys(data);
                } catch (error) {
                    console.error('Error fetching fencompanys:', error);
                }
            };

            fetchData();
        }
    }, [selectedCompany]);

    useEffect(() => {
        fetchData();
        fetchcompanys();

        fetchDepartments();
        fetchPositions();

    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/entry');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    const handleSearch = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/entry', {
                params: {
                    startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : null,
                    endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
                    username: searchName || null
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error searching data:', error);
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
            values.entryTime = dayjs(values.entryTime).format('YYYY-MM-DD');
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
                    ...values

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
                    .delete(`http://127.0.0.1:8888/entry/deleteBatch/${selectedIds.join(',')}`)
                    .then((response) => {
                        console.log('批量删除成功:', response.data);
                        setSelectedIds([]); // 清空勾选项
                        fetchData();
                        message.success('批量删除成功！');
                    })
                    .catch((error) => {
                        console.error('批量删除失败:', error);
                        message.error('批量删除失败！');
                        setSelectedIds([]); // 清空勾选项
                    });
            },
            onCancel() {
                console.log('取消批量删除');
            },
        });
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
    const showApprovalModal = (record) => {
        Modal.confirm({
            title: '审批',
            content: (
                <div>
                    <p>请选择审批结果：</p>
                    <Radio.Group onChange={(e) => handleApproval(e, record)}>
                        <Radio value={1}>审批通过</Radio>
                        <Radio value={0}>审批不通过</Radio>
                    </Radio.Group>
                </div>
            ),
            okText: '确认',
            cancelText: '取消',
        });
    };
    const handleApproval = async (e, record) => {
        const approvalResult = e.target.value;
        try {
            // Perform approval action based on the approvalResult (1 for approval, 0 for rejection)
            // Example: Send request to server to update approval status
            await axios.put(`YOUR_API_ENDPOINT/${record.id}`, { approvalResult });
            message.success('审批成功');
            fetchData(); // Refresh data after approval
        } catch (error) {
            console.error('Error approving entry:', error);
            message.error('审批失败，请重试');
        }
    };


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
            title: '工号',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
        },
        {
            title: '员工工号',
            dataIndex: 'empId',
            key: 'emp_id',
            width: '10%',
        },
        {
            title: '公司id',
            dataIndex: 'companyId',
            className:"notshow",
            key: 'companyId',
            width: '10%',
            render: () => null, // 将该列的render函数设置为返回null
        },

        {
            title: '分公司id',
            dataIndex: 'fencompanyId',
            className:"notshow",
            key: 'fencompanyId',
            width: '10%',
        },
        {
            title: '员工姓名',
            dataIndex: 'empName',
            key: 'empName',
            width: '10%',
        },
        {
            title: '状态',
            dataIndex: 'states',
            key: 'states',
            width: '10%',
            render: (states) => {
                let tagColor, tagLabel;
                switch (states) {
                    case 0:
                        tagColor = 'processing';
                        tagLabel = '申请中';
                        break;
                    case 1:
                        tagColor = 'success';
                        tagLabel = '审批通过';
                        break;
                    case 2:
                        tagColor = 'error';
                        tagLabel = '审批不通过';
                        break;
                    default:
                        tagColor = 'default';
                        tagLabel = '未知状态';
                }
                return (
                    <Tag color={tagColor}>
                        {tagLabel}
                    </Tag>
                );
            },
        },

        {
            title: '入职时间',
            dataIndex: 'entryTime',
            key: 'entry_time',
            width: '10%',
        },

        {
            title: '部门名称',
            dataIndex: 'deptName',
            key: 'deptName',
            width: '10%',
        },
        {
            title: '岗位名称',
            dataIndex: 'postName',
            key: 'postName',
            width: '10%',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => showApprovalModal(record)}>审批</a>
                    <a onClick={() => showEditModal(record)}>修改</a>
                    <a onClick={() => showDeleteConfirm(record.id)}>删除</a>
                </Space>
            ),
            width: '15%',
        }

    ];

    const showModal = () => {
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {

        console.log(record)
        console.log("==============")
        setIsEditModalVisible(true);
        setEditingRecord(record);

        const entryTime1 = record.entryTime ? dayjs(record.entryTime) : null;
        // 设置表单字段的值
        form.setFieldsValue({ ...record, entryTime: entryTime1 });

    };

    const fetchcompanys = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/empDept/company');
            setCompanys(response.data);
        } catch (error) {
            console.error('Error fetching companys:', error);
        }
    };
    //获取分公司
    const fetchfencompanys = async (selectedCompany) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8888/empDept/fencompany?id=${selectedCompany}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching fencompanys:', error);
            return null;
        }
    };
    const fetchDepartments = async (value) => {
        try {
            console.log('fetchDepartments')
            const response = await axios.get(`http://127.0.0.1:8888/empDept/fencompany?id=${value??selectedFencompany}`);
            console.log('selectedFencompany:',selectedFencompany)
            console.log('response.data:',response.data)
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8888/empPost');
            setPositions(response.data);
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    function handleNameInputChange(value) {

    }

    const createCascaderOptions = () => {
        const cascaderOptions = [];

        companys.forEach(company => {
            const companyOption = {
                value: company.deptId,
                label: company.deptName,
                children: []
            };

            fencompanys.forEach(fencompany => {
                if (fencompany.companyId === company.deptId) {
                    const fencompanyOption = {
                        value: fencompany.deptId,
                        label: fencompany.deptName,
                        children: []
                    };

                    departments.forEach(department => {
                        if (department.fencompanyId === fencompany.deptId) {
                            fencompanyOption.children.push({
                                value: department.deptId,
                                label: department.deptName
                            });
                        }
                    });

                    companyOption.children.push(fencompanyOption);
                }
            });

            cascaderOptions.push(companyOption);
        });

        return cascaderOptions;
    };
    const handleCascaderChange = (value, selectedOptions) => {
        if (selectedOptions && selectedOptions.length > 0) {
            setSelectedCompany(selectedOptions[0]?.value); // 使用可选链接避免selectedOptions[0]为undefined时出错
            setSelectedFencompany(selectedOptions[1]?.value); // 使用可选链接避免selectedOptions[1]为undefined时出错
            form.setFieldsValue({ deptId: selectedOptions[2]?.value }); // 使用可选链接避免selectedOptions[2]为undefined时出错
        }
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Search
                    placeholder="输入姓名进行搜索"
                    onSearch={handleSearch}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ width: 200, marginRight: 10 }}
                />
                <RangePicker
                    style={{ marginRight: 8 }}
                    value={[startDate, endDate]}
                    onChange={(dates) => {
                        if (dates && dates.length > 0) {
                            setStartDate(dates[0]);
                            setEndDate(dates[1]);
                        } else {
                            setStartDate(null);
                            setEndDate(null);
                        }
                    }}
                />
                <Button type="primary" onClick={handleSearch}>
                    Search
                </Button>
                <Button type="primary" onClick={showModal}>
                    添加入职
                </Button>
                <Button type="primary" onClick={handelDelBatch}>
                    批量删除
                </Button>
            </Space>
            <Table columns={columns} dataSource={data} />

            <Modal title="添加入职" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="员工工号" name="empId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="员工姓名" name="empName">
                        <Input />
                    </Form.Item>
                    <Form.Item label="状态" name="states" initialValue={0}>
                        <Radio.Group defaultValue={0}>
                            <Radio value={0}>发起请求</Radio>
                            <Radio value={1} disabled>审批通过</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="入职时间" name="entryTime">
                        <DatePicker placeholder="请选择入职时间" />
                    </Form.Item>

                    <Form.Item label="公司、分公司、部门" name="companyFencompanyDept">
                        <Cascader
                            options={createCascaderOptions()}
                            onChange={handleCascaderChange}
                            placeholder="请选择公司、分公司、部门"
                        />
                    </Form.Item>

                    <Form.Item label="岗位" name="postId">
                        <Select>
                            {positions.map((position) => (
                                <Option key={position.postId} value={position.postId}>
                                    {position.postName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="修改入职" visible={isEditModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form}>
                    <Form.Item label="员工工号" name="empId">
                        <Input />
                    </Form.Item>
                    <Form.Item label="员工姓名" name="empName">
                        <Input />
                    </Form.Item>
                    <Form.Item label="状态" name="states" initialValue={0}>
                        <Radio.Group defaultValue={0}>
                            <Radio value={0}>发起请求</Radio>
                            <Radio value={1}>审批通过</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="入职时间" name="entryTime">
                        <DatePicker placeholder="请选择入职时间" />
                    </Form.Item>


                    <Form.Item label="公司" name="companyId">
                        <Select onChange={setSelectedCompany} value={selectedCompany}>
                            {companys.map((company) => (
                                <Option key={company.deptId} value={company.deptId}>
                                    {company.deptName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="分公司" name="fencompanyId">
                        <Select onChange={(value) => { setSelectedFencompany(value);
                            debugger
                            fetchDepartments(value); }} value={selectedFencompany}>
                            {fencompanys.map((fencompany) => (
                                <Option key={fencompany.deptId} value={fencompany.deptId}>
                                    {fencompany.deptName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="部门" name="deptId">
                        <Select>
                            {departments.map((department) => (
                                <Option key={department.deptId} value={department.deptId}>
                                    {department.deptName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="岗位" name="postId">
                        <Select>
                            {positions.map((position) => (
                                <Option key={position.postId} value={position.postId}>
                                    {position.postName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeEntryManagement;
