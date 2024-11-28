import axios from 'axios';

export const getTenantAccessToken = async () => {
    try {
        const response = await axios.post('https://cors-anywhere.herokuapp.com/https://open.larksuite.com/open-apis/auth/v3/t-g206b57lVCSFCDIG5DJR3FNKGAC7VH3J6OX5NNLW/internal', {
            app_id: process.env.REACT_APP_LARK_APP_ID,
            app_secret: process.env.REACT_APP_LARK_APP_SECRET
        });
        return response.data.tenant_access_token;
    } catch (error) {
        console.error('Lỗi khi lấy token:', error);
        return null;
    }
};

