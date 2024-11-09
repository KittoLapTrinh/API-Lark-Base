require('dotenv').config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 8000;
app.use(express.json());

const accessToken = process.env.ACCESS_TOKEN;

app.use(cors());

app.get("/records", async (req, res) => {
  const url = "https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records";
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const records = response.data.items.map(record => ({
      code: 0,
      data: {
        record: {
          fields: {
            address: record.fields.address,
            companyName: record.fields.companyName,
            gmail: record.fields.gmail,
            id: record.fields.id,
            phone: record.fields.phone,
            recordId: record.record_id ? [{
              text: record.record_id,
              type: "text"
            }] : [],
          },
          id: record.record_id,
          record_id: record.record_id
        }
      },
      msg: "success"
    }));

    

    res.json(records.length > 0 ? records : { message: "Không có dữ liệu hoặc có lỗi khi lấy dữ liệu" });
  } catch (error) {
    console.error("Error fetching records:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy dữ liệu" });
  }
});


// Hàm gửi thông báo khi thao tác CRUD thành công
// async function sendSuccessMessage(userToken, action) {
//   const message = `${action} thành công! Token người dùng: ${userToken}`;
//   // Giả sử bạn gửi thông báo qua API (có thể là Lark Suite hoặc một hệ thống nhắn tin khác)
//   const url = "https://api.larksuite.com/send-message";  // Giả sử URL này là API gửi thông báo

//   const messageData = {
//     userToken: userToken,
//     message: message,
//   };

//   try {
//     const response = await axios.post(url, messageData, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//     });

//     return response.data;  // Trả về phản hồi từ API gửi thông báo
//   } catch (error) {
//     console.error("Lỗi gửi thông báo:", error);
//     return null;
//   }
// }

// API tạo bản ghi
app.post("/addRecord", async (req, res) => {
  const url = "https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records";

  // Chỉnh sửa cấu trúc dữ liệu để gửi theo yêu cầu
  const newRecordData = [{
    code: 0,
    data: {
      record: {
        fields: {
          address: req.body.address,
          companyName: req.body.companyName,
          gmail: req.body.gmail,
          id: req.body.id,
          phone: req.body.phone,
          recordId: [
            {
              text: req.body.recordId,
              type: "text"
            }
          ],
        },
        id: response.data.data.id,  // id trả về từ API (nếu có)
        record_id: response.data.data.id  // record_id trả về từ API (nếu có)
      }
    },
    msg: "success"
  }]

  try {
    // Gửi POST request để thêm bản ghi
    const response = await axios.post(url, newRecordData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Gửi thông báo thành công
    const userToken = req.body.userToken;  // Token người dùng được truyền từ client
    await sendSuccessMessage(userToken, "Thêm bản ghi");

    // Trả lại dữ liệu thành công theo cấu trúc yêu cầu
    res.json([{
      code: 0,
      data: {
        record: {
          fields: {
            address: req.body.address,
            companyName: req.body.companyName,
            gmail: req.body.gmail,
            id: req.body.id,
            phone: req.body.phone,
            recordId: [
              {
                text: req.body.recordId,
                type: "text"
              }
            ],
          },
          id: response.data.data.id,  // id trả về từ API (nếu có)
          record_id: response.data.data.id  // record_id trả về từ API (nếu có)
        }
      },
      msg: "success"
    }]);
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({ message: "Error adding record", error: error.message });
  }
});



// API cập nhật bản ghi
app.put("/records/:record_id", async (req, res) => {
  const record_id = req.params.record_id;
  const updatedData = req.body;

  const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records/${record_id}`;
  
  try {
    const response = await axios.put(url, { fields: updatedData }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    // Gửi thông báo thành công
    const userToken = req.body.userToken;
    await sendSuccessMessage(userToken, "Cập nhật bản ghi");

    res.json({ message: "Cập nhật bản ghi thành công", data: response.data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật bản ghi", error: error.message });
  }
});

// API xóa bản ghi
app.delete("/records/:record_id", async (req, res) => {
  const record_id = req.params.record_id;

  const url = `https://open.larksuite.com/open-apis/bitable/v1/apps/ZOajbULYSaHIMAsYuHKlAt4Jgkc/tables/tbl6VJkABgGjEMX2/records/${record_id}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Gửi thông báo thành công
    const userToken = req.body.userToken;
    await sendSuccessMessage(userToken, "Xóa bản ghi");

    res.json({ message: "Xóa bản ghi thành công", data: response.data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa bản ghi", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
