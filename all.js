console.clear();

// 代入自己的網址路徑
const apiPath = "weixiang";
const token = "MqnUOQ9UDEQ4oaVgt6VYu3dQ2Uu1";
const baseUrl = "https://livejs-api.hexschool.io";
const indexUrl = `${baseUrl}/api/livejs/v1/customer/${apiPath}`;
const adminUrl = `${baseUrl}/api/livejs/v1/admin/${apiPath}`;

const indexInstance = axios.create({
  baseURL: `${indexUrl}`,
});
const adminInstance = axios.create({
  baseURL: `${adminUrl}`,
  headers: {
    Authorization: `${token}`,
  },
});
