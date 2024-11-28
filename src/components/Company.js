import React, { useEffect, useState } from "react";
import axios from "axios";

const Company = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    id: "",
    record_id: "",
    companyName: "",
    address: "",
    gmail: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false); // State to check if editing mode is active

  const sendNotification = async (message) => {
    // console.log(message);
    
    try {
      await axios.post("http://localhost:8000/sendMessage", {
        user_id: "u-dyOaOhOaxepFvoUpZLj3Z3453.8q4gtFiM0w5lS02b9U", // ID người nhận
        message: message, // Nội dung thông báo
        
      });
      
      
      console.log("Notification sent successfully.");
    } catch (error) {
      console.error("Error sending notification:", error);
      
      
    }
  };

  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  // Handle submit (Add or Edit record)
  const handleSubmit = async () => {
    const url = isEditing
      ? `http://localhost:8000/records/${formData.record_id}`
      : "http://localhost:8000/addRecord";
    const method = isEditing ? "PUT" : "POST";
  
    try {
      console.log("Dữ liệu gửi đi:", formData);
  
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        alert(`Có lỗi xảy ra: ${errorData.message || "Không rõ lỗi"}`);
        return;
      }
  
      const data = await response.json();
  
      // Kiểm tra nếu thông báo thành công chứa từ "thành công" hoặc "success"
      if (data.message && /thành công|success/i.test(data.message)) {
        alert(isEditing ? "Cập nhật bản ghi thành công!" : "Thêm bản ghi thành công!");
        fetchRecords(); // Tải lại dữ liệu sau khi thêm/sửa
      } else {
        console.error("Lỗi chi tiết:", data);
        alert("Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert(`Có lỗi xảy ra khi thực hiện thao tác: ${error.message}`);
    } finally {
      setIsEditing(false);
      setFormData({ id: "", record_id: "", companyName: "", address: "", gmail: "", phone: "" });
    }
  };
  

  // Edit record
  const editRecord = (record) => {
    console.log(record);
    setFormData(record);
    setIsEditing(true); // Enable editing mode
  };

  // Delete record
  const deleteRecord = async (record_id) => {
    console.log(record_id);

    try {
      axios.delete(`http://localhost:8000/records/${record_id}`);
      setRecords((prevRecords) => prevRecords.filter((record) => record.record_id !== record_id));
      alert("Xóa bản ghi thành công!");
      // await sendNotification("Data deleted successfully.");
    } catch (error) {
      console.error("Lỗi khi xóa bản ghi:", error);
      alert("Có lỗi xảy ra khi xóa bản ghi.");
    }
  };

  // Fetch records
  const fetchRecords = async () => {
    try {
      const response = await axios.get("http://localhost:8000/records");
      setRecords(response.data.records);
      setFilteredRecords(response.data.records);
      setLoading(false);
    } catch (error) {
      setError("Không thể lấy dữ liệu từ API");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const result = records.filter((record) =>
      record.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(result);
  }, [searchTerm, records]);

  if (loading) return <div><p>Đang tải dữ liệu...</p></div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ margin: '20px', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#333', marginBottom: '20px' }}>Danh sách công ty</h2>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên công ty..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Record ID</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên công ty</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Địa chỉ</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Số điện thoại</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords && filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <tr key={record.record_id}>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.id}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.record_id}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.companyName}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.address}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.gmail}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.phone}</td>
                <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <button
                    style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: 5 }}
                    onClick={() => editRecord(record)}
                  >
                    Edit
                  </button>
                  

                  <button
                    style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => deleteRecord(record.record_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Không có bản ghi nào</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ backgroundColor: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h1>Form Company</h1>
        <br />
        <input
          style={{  width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
          type="text"
          name="id"
          placeholder="Nhập vào ID"
          value={formData.id}
          onChange={handleInputChange}
          // readOnly // khong cho chinh sua recordId
          required
        />
        <br />
        <input
          style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
          type="text"
          name="companyName"
          placeholder="Tên công ty"
          value={formData.companyName}
          onChange={handleInputChange}
        />
        <input
          style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={handleInputChange}
        />
        <input
          style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
          type="email"
          name="gmail"
          placeholder="Email"
          value={formData.gmail}
          onChange={handleInputChange}
        />
        <input
          style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleInputChange}
        />
        <button
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleSubmit}
        >
          {isEditing ? "Cập nhật" : "Thêm"}
        </button>
        <button
                    style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px', marginRight: 15 }}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ id: "", record_id: "", companyName: "", address: "", gmail: "", phone: "" });
                    }}
                  >
                    Hủy
                  </button>
      </div>
    </div>
  );
};

export default Company;
