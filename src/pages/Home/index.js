import React from "react";
import BarChart from "./components/BarChart";
import swal from "sweetalert";
import { Button } from "antd";

const Home = () => {
    const handleClick = () => {
        swal({
            title: "Hello world!",
            text: "",
            icon: "info",
            buttons: false,
            className: "custom-swal",
            content: {
                element: "p",
                attributes: {
                    innerHTML: "Hello world!",
                    style: "font-size: 20px;"
                }
            }
        });
    };

    const handleClickOK = () => {
        swal("Good job!", "You clicked the button!", "success");
    };

    const handleClickError = () => {
        swal("error!", "You clicked the button!", "error");
    };

    const handleDeleteConfirmation = () => {
        swal({
            title: "您确定吗？",
            text: "一旦删除，您将无法恢复此文件！",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    swal("您的文件已被删除！", {
                        icon: "success",
                    });
                } else {
                    swal("您的文件是安全的！");
                }
            });
    };


    return (
        <div>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
                <div style={{ flex: "1 1 50%" }}>
                    <BarChart title={"员工评优排行榜"} />
                </div>
                <div style={{ flex: "1 1 50%" }}>
                    <BarChart title={"员工打卡排行榜"} />
                </div>
            </div>
            <div>
                <Button type="primary" danger ghost onClick={handleClick}>普通提示</Button>
                <Button type="primary" style={{ marginLeft: "5px" }} onClick={handleClickOK}>
                    添加成功
                </Button>
                <Button type="primary" style={{ marginLeft: "5px" }} danger ghost onClick={handleClickError}>
                    添加失败
                </Button>
                <Button type="primary" style={{ marginLeft: "5px" }} onClick={handleDeleteConfirmation}>
                    删除文件
                </Button>
            </div>
        </div>
    );
};

export default Home;
