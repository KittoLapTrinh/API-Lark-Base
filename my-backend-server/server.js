require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());

const accessToken = process.env.ACCESS_TOKEN;
const tenantAccessToken = process.env.TENANT_ACCESS_TOKEN;

//Hàm lấy access token hợp lệ
async function getAccessToken() {
  return process.env.ACCESS_TOKEN || "";
}

async function getUserInfomation() {
  const url = "https://open.larksuite.com/open-apis/authen/v1/user_info";
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Lấy user_id từ phản hồi
    const user_id = response.data.data.user_id;

    console.log("User ID:", user_id);
    return user_id;

  } catch (error) {
    console.error("Error fetching user information:", error.message);
  }
}






// API gửi tin nhắn
async function sendMessage(message) {
  try {
    // Tạo đối tượng nội dung tin nhắn


    
    // Tạo đối tượng data với nội dung tin nhắn
    const data = {
      receive_id: "5127bcb7",  // ID người nhận
      msg_type: "text",
      content: JSON.stringify({ text: message }), // Nội dung tin nhắn đã stringify
    };
        // Stringify đối tượng và tự động escape dấu nháy kép
        const contentString = JSON.stringify(data);
    console.log("Data sent:", data);  // Kiểm tra dữ liệu gửi đi

    // URL API gửi tin nhắn
    const url = "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=user_id";

    // Gửi yêu cầu POST tới API
    const response = await axios.post(url, {
      "receive_id": "5127bcb7",
      "msg_type": "text",
      content: JSON.stringify({ text: message }),
    }, {
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`,  // Thêm token hợp lệ vào header
        "Content-Type": "application/json",  // Định dạng dữ liệu là JSON
      },
    });

    console.log("Message sent successfully:", response.data);

  } catch (error) {
    console.error("Error sending message:", error.message);
  }
}


// Hàm lấy tất cả các bản ghi
async function getAllRecords() {
  const url = "https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records";

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.data.items.map(record => ({
      id: record.fields.id,
      record_id: record.record_id,
      companyName: record.fields.companyName,
      address: record.fields.address,
      phone: record.fields.phone,
      gmail: record.fields.gmail,
    }));
  } catch (error) {
    console.error("Error fetching records:", error);
    return [];
  }
}

// Endpoint lấy tất cả bản ghi
app.get("/records", async (req, res) => {
  const records = await getAllRecords();
  if (records.length > 0) {
    res.json({ records });
  } else {
    res.status(500).json({ message: "Không có dữ liệu hoặc có lỗi khi lấy dữ liệu" });
  }
});

// API tạo bản ghi
app.post("/addRecord", async (req, res) => {
  const url = "https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records";
 
  const id = req.body.id;
  const newRecordData = {
    fields: {
      id: req.body.id,
      companyName: req.body.companyName,
      address: req.body.address,
      gmail: req.body.gmail,
      phone: req.body.phone,
    },
  };

  try {
    const response = await axios.post(url, newRecordData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const message = `Bạn đã tạo bản ghi với id: ${id}`;
    await sendMessage(message);
    res.json({ message: "Record added successfully", data: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error adding record", error: error.message });
  }
});

// API cập nhật bản ghi
app.put("/records/:record_id", async (req, res) => {

  try {

    const record_id = req.params.record_id;
    console.log(record_id);
    
    const updatedData = {
      fields: {
        id: req.body.id,
        companyName: req.body.companyName,
        address: req.body.address,
        phone: req.body.phone,
        gmail: req.body.gmail,
      },
    };
    console.log(updatedData);
    
  
    const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records/${record_id}`;
  
    const response = await axios.put(url, updatedData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const message = `Bạn đã cập nhật thành công với bản ghi record_id: ${record_id}`;
    await sendMessage(message);
    res.json({ message: "Cập nhật bản ghi thành công", data: response.data });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send({ message: "Error updating data" });
  }
});

// API xóa bản ghi
app.delete("/records/:record_id", async (req, res) => {
  const record_id = req.params.record_id;
  // const token = await getAccessToken();  // Lấy accessToken hợp lệ
  
  const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records/${record_id}`;

  try {
    // Gửi yêu cầu xóa bản ghi từ Lark API
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,  // Sử dụng accessToken từ .env
        "Content-Type": "application/json",
      },
    });

    // Gửi tin nhắn thông báo xóa bản ghi
    const message = `Bạn đã xóa bản ghi với ID: ${record_id}`;
    await sendMessage(message);

    // Trả về thông báo thành công
    res.json({ message: "Xóa bản ghi thành công", data: response.data });
  } catch (error) {
    // Xử lý lỗi khi gọi API hoặc lỗi từ Lark API
    console.error("Lỗi khi xóa bản ghi:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Lỗi khi xóa bản ghi", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
