import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CTY = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState([{
    code: '',
    data: {
      record: {
        fields: {
          address: '',
          companyName: '',
          gmail: '',
          id: '',
          phone: '',
          recordId: [
            {
              text: '',
              type: ''
            }
          ],
        },
        id: '',  // id trả về từ API (nếu có)
        record_id: ''  // record_id trả về từ API (nếu có)
      }
    },
    msg: "success"
  }]);
  
  const [isEditing, setIsEditing] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fetch records data from API
  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:8000/records');
      setRecords(response.data);
      setLoading(false);
    } catch (error) {
      setError('Không thể lấy dữ liệu từ API');
      setLoading(false);
    }
  };

  // Load records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Delete a record
  const deleteRecord = async (record_id) => {
    try {
      await axios.delete(`http://localhost:8000/records/${record_id}`);
      setRecords((prevRecords) => prevRecords.filter((record) => record.data.record.record_id !== record_id));
      alert('Xóa bản ghi thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa bản ghi:', error);
      alert('Có lỗi xảy ra khi xóa bản ghi.');
    }
  };

  // Submit form data (either add or update record)
  const handleSubmit = async () => {
    const url = isEditing ? `http://localhost:8000/records/${formData.record_id}` : 'http://localhost:8000/addRecord';
    const method = isEditing ? 'PUT' : 'POST';
    console.log(formData);
    
    const requestData = {
      fields: {
        id: formData.id,
        companyName: formData.companyName,
        address: formData.address,
        gmail: formData.gmail,
        phone: formData.phone,
        recordId: [
          {
            text: formData.record_id,
            type: 'text',
          },
        ],
        
      },
        id: formData.id,
        record_id: formData.id
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi từ server:', errorData);
        alert(`Có lỗi xảy ra: ${errorData.message || 'Không rõ lỗi'}`);
        return;
      }

      const data = await response.json();

      if (data.message === (isEditing ? 'Record updated successfully' : 'Record added successfully')) {
        alert(isEditing ? 'Cập nhật bản ghi thành công!' : 'Thêm bản ghi thành công!');
        fetchRecords(); // Refresh the records list after submit
      } else {
        console.error('Lỗi chi tiết:', data);
        alert('Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert(`Có lỗi xảy ra khi thực hiện thao tác: ${error.message}`);
    } finally {
      setIsEditing(false);
      setFormData([{
        code: '',
        data: {
          record: {
            fields: {
              address: '',
              companyName: '',
              gmail: '',
              id: '',
              phone: '',
              recordId: [
                {
                  text: '',
                  type: ''
                }
              ],
            },
            id: '',  // id trả về từ API (nếu có)
            record_id: ''  // record_id trả về từ API (nếu có)
          }
        },
        msg: "success"
      }]);
    }
  };

  // Edit a record
  const editRecord = (recordData) => {
    const record = recordData.data.record.fields;
    setFormData([{
        code: '',
        data: {
          record: {
            fields: {
              address: record.address,
              companyName: record.companyName,
              gmail: record.gmail,
              id: record.id,
              phone: record.phone,
              recordId: [
                {
                  text: record.id,
                  type: record.text
                }
              ],
            },
            id: record.id,  // id trả về từ API (nếu có)
            record_id: record.id  // record_id trả về từ API (nếu có)
          }
        },
        msg: "success"
      }]);
    setIsEditing(true);
  };

  return (
    <div>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            {records && records.length > 0 ? (
              records.map((recordData) => {
                const record = recordData.data.record.fields;
                const recordId = record.recordId;

                return (
                  <tr key={recordData.data.record.record_id}>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.id}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      {recordId && recordId.length > 0 ? (
                        recordId.map((idItem, index) => <span key={index}>{idItem.text}</span>)
                      ) : (
                        'Không có Record ID'
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.companyName}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.address}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.gmail}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{record.phone}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <button
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#007BFF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: 5,
                        }}
                        onClick={() => editRecord(recordData)}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        onClick={() => deleteRecord(recordData.data.record.record_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Không có bản ghi nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <div style={{ backgroundColor: '#fff', padding: '20px', marginTop: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h1>Form Company</h1>
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="text"
          name="record_id"
          placeholder="record_id"
          value={formData.record_id}
          onChange={handleInputChange}
          readOnly
          required
        />
        <br />
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="text"
          name="id"
          placeholder="Nhập vào Record ID"
          value={formData.id}
          onChange={handleInputChange}
          required
        />
        <br />
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="text"
          name="companyName"
          placeholder="Nhập vào Tên công ty"
          value={formData.companyName}
          onChange={handleInputChange}
          required
        />
        <br />
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="text"
          name="address"
          placeholder="Nhập vào Địa chỉ"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
        <br />
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="email"
          name="gmail"
          placeholder="Nhập vào Email"
          value={formData.gmail}
          onChange={handleInputChange}
          required
        />
        <br />
        <input
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
          type="tel"
          name="phone"
          placeholder="Nhập vào Số điện thoại"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <br />
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={handleSubmit}
        >
          {isEditing ? 'Cập nhật bản ghi' : 'Thêm bản ghi'}
        </button>
      </div>
    </div>
  );
};

export default CTY;
