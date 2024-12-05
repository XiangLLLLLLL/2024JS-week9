console.clear();

// 取得訂單列表
let orderListData = [];
const getOrderList = async () => {
  try {
    const response = await adminInstance.get("/orders");
    orderListData = response.data.orders;
    calcProductCategory();
    calcProductTitle();
    renderOrderList(orderListData);
  } catch (error) {
    console.error("取得訂單列表失敗!", error.response.data);
    alert("取得訂單列表發生錯誤，請稍後再試。");
  }
};
const orderPageTbody = document.querySelector(".orderPage-table tbody");
const renderOrderList = (orderData) => {
  let str = "";
  orderData.forEach((item) => {
    let productsStr = "";
    item.products.forEach((item) => {
      productsStr += `<p>${item.title} x${item.quantity}</p>`;
    });
    str += `<tr data-id="${item.id}">
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                <p>${productsStr}</p>
              </td>
              <td>${item.createdAt}</td>
              <td class="orderStatus">
                <a href="#" class="changeStatus">${item.paid ? "已處理" : "未處理"}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" />
              </td>
            </tr>`;
  });
  orderPageTbody.innerHTML = str;
};

// 修改訂單狀態
const editOrderList = async (id) => {
  const result = orderListData.filter((item) => {
    return item.id === id;
  });
  let data = {
    data: {
      id: id,
      paid: !result[0].paid,
    },
  };
  try {
    const response = await adminInstance.put("/orders", data);
    orderListData = response.data.orders;
    renderOrderList(orderListData);
  } catch (error) {
    console.error("修改訂單狀態失敗!", error.resonse.data);
    alert("修改訂單狀態發生錯誤，請稍後再試。");
  }
};

// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
const deleteAllOrder = async () => {
  try {
    const response = await adminInstance.delete("/orders");
    orderListData = response.data.orders;
    calcProductCategory();
    calcProductTitle();
    renderOrderList(orderListData);
  } catch (error) {
    console.error("刪除全部訂單失敗!", error.response.data);
    alert("刪除全部訂單發生錯誤，請稍後再試。");
  }
};

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllOrder();
});

// 刪除特定訂單
const orderTableWrap = document.querySelector(".orderTableWrap");
const deleteOrderItem = async (orderId) => {
  try {
    const response = await adminInstance.delete(`/orders/${orderId}`);
    orderListData = response.data.orders;
    calcProductCategory();
    calcProductTitle();
    renderOrderList(orderListData);
  } catch (error) {
    console.error("刪除訂單失敗!");
    alert("刪除訂單發生錯誤，請稍後再試。");
  }
};
orderTableWrap.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("delSingleOrder-Btn")) {
    const orderId = e.target.closest("tr").getAttribute("data-id");
    deleteOrderItem(orderId);
  }
  if (e.target.classList.contains("changeStatus")) {
    const id = e.target.closest("tr").getAttribute("data-id");
    editOrderList(id);
  }
});

// 渲染圓餅圖LV1 全產品類別營收比重
const productCategoryBtn = document.querySelector(".productCategory-btn");
const productTitleBtn = document.querySelector(".productTitle-btn");
const productCategory = document.querySelector(".productCategory");
const productTitle = document.querySelector(".productTitle");
const calcProductCategory = () => {
  let productsData = {};
  orderListData.forEach((item) => {
    item.products.forEach((item) => {
      if (productsData[item.category] === undefined) {
        productsData[item.category] = item.price * item.quantity;
      } else {
        productsData[item.category] += item.price * item.quantity;
      }
    });
  });
  let productsDataArr = Object.entries(productsData);
  renderChart(productsDataArr);
};
const renderChart = (data) => {
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
    },
    data: {
      type: "pie",
      columns: data,
    },
  });
};

// 渲染圓餅圖LV2 全品項營收比重

const calcProductTitle = () => {
  let productsData = {};
  orderListData.forEach((item) => {
    item.products.forEach((item) => {
      if (productsData[item.title] === undefined) {
        productsData[item.title] = item.price * item.quantity;
      } else {
        productsData[item.title] += item.price * item.quantity;
      }
    });
  });
  let productsDataArr = Object.entries(productsData).sort((a, b) => {
    return b[1] - a[1];
  });
  let topOfThreeArr = [];
  let otherTotal = 0;
  productsDataArr.forEach((item, index) => {
    if (index <= 2) {
      topOfThreeArr.push(item);
    } else if (index > 2) {
      otherTotal += item[1];
    }
  });
  if (productsDataArr.length > 3) {
    topOfThreeArr.push(["其他", otherTotal]);
  }
  renderChart2(topOfThreeArr);
};
const renderChart2 = (data) => {
  // C3.js
  let chart = c3.generate({
    bindto: "#chart2", // HTML 元素綁定
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
    },
    data: {
      type: "pie",
      columns: data,
    },
  });
};
productCategoryBtn.addEventListener("click", () => {
  productCategory.style.display = "block";
  productTitle.style.display = "none";
});
productTitleBtn.addEventListener("click", () => {
  productCategory.style.display = "none";
  productTitle.style.display = "block";
});
function init() {
  getOrderList();
}
init();
