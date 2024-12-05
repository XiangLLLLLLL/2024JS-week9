console.clear();
const init = () => {
  getProductsList();
  getCartList();
};

// 取得產品列表
let productsListdata = [];
const getProductsList = async () => {
  try {
    const response = await indexInstance.get("/products");
    productsListdata = response.data.products;
    renderProductsList(productsListdata);
  } catch (error) {
    console.error("取得產品列表失敗", error.response.data);
    alert("取得產品列表時發生錯誤，請稍後再試。");
  }
};
// 渲染產品列表
const productWrap = document.querySelector(".productWrap");
const renderProductsList = (data) => {
  let str = "";
  data.map((item) => {
    str += `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}" alt="" />
          <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${item.origin_price}</del>
          <p class="nowPrice">NT$${item.price}</p>
        </li>`;
  });
  productWrap.innerHTML = str;
};

// 篩選產品列表
const productSelect = document.querySelector(".productSelect");
const filterProductsList = () => {
  const resultData = productsListdata.filter((item) => {
    if (item.category === productSelect.value) {
      return item;
    } else if (productSelect.value === "全部") {
      return item;
    }
  });
  renderProductsList(resultData);
};
productSelect.addEventListener("change", () => filterProductsList());
// 取得購物車列表
let cartListData = [];
const getCartList = async () => {
  try {
    const response = await indexInstance.get("/carts");
    cartListData = response.data.carts;
    cartTotal = response.data.cartTotal;
    cartFinalTotal = response.data.finalTotal;
    renderCartList(cartListData);
  } catch (error) {
    console.error("取得購物車列表失敗!", error.response.data);
    alert("取得購物車列表時發生錯誤，請稍後再試。");
  }
};

// 渲染購物車列表
const shoppingCartList = document.querySelector(".shoppingCart-table tbody");
const shoppingCartTotal = document.querySelector(".shoppingCart-table tfoot");
const shoppingCart = document.querySelector(".shoppingCart");
let cartTotal = 0;
let cartFinalTotal = 0;
const renderCartList = async () => {
  if (cartListData.length === 0) {
    shoppingCartList.innerHTML = "購物車內沒有商品";
    shoppingCartTotal.innerHTML = "";
    return;
  }
  let listStr = "";
  cartListData.forEach((item) => {
    listStr += `<tr data-id="${item.id}">
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="${item.product.title}" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${item.product.origin_price}</td>
              <td><button class="addBtn me-8">+</button>${item.quantity}<button class="minusBtn ms-8">-</button></td>
              <td>NT$${item.product.price}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons disBtn"> clear </a>
              </td>
            </tr>`;
  });
  shoppingCartList.innerHTML = listStr;
  shoppingCartTotal.innerHTML = `<tr>
              <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td>NT$${cartFinalTotal}</td>
            </tr>`;
};

// 加入購物車
const addCartItem = async (id) => {
  try {
    const response = await indexInstance.post("/carts", {
      data: {
        productId: id,
        quantity: 1,
      },
    });
    cartListData = response.data.carts;
    cartTotal = response.data.cartTotal;
    cartFinalTotal = response.data.finalTotal;
    renderCartList(cartListData);
    console.log(response);
  } catch (error) {
    console.error("加入購物車失敗", error.response.data);
    alert("加入購物車時發生錯誤，請稍後再試。");
  }
};
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  addCartItem(e.target.dataset.id);
});

// 編輯產品數量
const updateCart = async (cartId, qry) => {
  try {
    const data = {
      data: {
        id: cartId,
        quantity: qry,
      },
    };
    const response = await indexInstance.patch("/carts", data);
    cartListData = response.data.carts;
    cartTotal = response.data.cartTotal;
    cartFinalTotal = response.data.finalTotal;
    renderCartList();
  } catch (error) {
    console.error("刪除失敗!", error.resonse.data);
    alert("刪除時發生錯誤，請稍後再試。");
  }
};

// 清除購物車內全部產品
const deleteAllCartList = async () => {
  try {
    const response = await indexInstance.delete("/carts");
    cartListData = response.data.carts;
    cartTotal = response.data.cartTotal;
    cartFinalTotal = response.data.finalTotal;
    renderCartList();
  } catch (error) {
    console.error("清除購物車失敗!", error.resonse.data);
    alert("清除購物車時發生錯誤，請稍後再試。");
  }
};

// 刪除購物車內特定產品
const deleteCartItem = async (cartId) => {
  try {
    const response = await indexInstance.delete(`/carts/${cartId}`);
    cartListData = response.data.carts;
    cartTotal = response.data.cartTotal;
    cartFinalTotal = response.data.finalTotal;
    renderCartList();
  } catch (error) {
    console.error("刪除失敗!", error.resonse.data);
    alert("刪除時發生錯誤，請稍後再試。");
  }
};

// 購物車內的點擊事件
shoppingCart.addEventListener("click", (e) => {
  e.preventDefault();
  let id = e.target.closest("tr").getAttribute("data-id");
  if (e.target.classList.contains("discardAllBtn")) {
    deleteAllCartList();
  } else if (e.target.classList.contains("disBtn")) {
    deleteCartItem(id);
  } else if (e.target.classList.contains("addBtn")) {
    let result = {};
    cartListData.forEach((item) => {
      if (item.id === id) {
        result = item;
      }
    });
    qry = result.quantity + 1;
    updateCart(id, qry);
  } else if (e.target.classList.contains("minusBtn")) {
    let result = {};
    cartListData.forEach((item) => {
      if (item.id === id) {
        result = item;
      }
    });
    if (result.quantity <= 1) {
      qry = 1;
    } else {
      qry -= 1;
    }
    updateCart(id, qry);
  }
});

// 送出購買訂單
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoForm = document.querySelector(".orderInfo-form");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

const createOrder = async () => {
  let data = {
    data: {
      user: {
        name: customerName.value.trim(),
        tel: customerPhone.value.trim(),
        email: customerEmail.value.trim(),
        address: customerAddress.value.trim(),
        payment: tradeWay.value,
      },
    },
  };
  if (checkUserInfo()) {
    alert("請填寫完整的用戶信息！");
    return; // 直接返回，不發送請求
  }
  try {
    const response = await indexInstance.post("/orders", data);
    orderInfoForm.reset();
    getCartList();
  } catch (error) {
    console.error("送出訂單失敗!", error.response.data);
    alert("送出訂單時發生錯誤，請稍後再試。");
  }
};
orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  createOrder();
});
const checkUserInfo = () => {
  const constraints = {
    姓名: {
      presence: { message: "^必填" },
    },
    電話: {
      presence: { message: "^必填" },
    },
    Email: {
      presence: { message: "^必填" },
      email: { message: "^請輸入正確的信箱格式" },
    },
    寄送地址: {
      presence: { message: "^必填" },
    },
  };
  const error = validate(orderInfoForm, constraints);
  if (error) {
    const errorArr = Object.keys(error);
    errorArr.forEach((item) => {
      const message = document.querySelector(`[data-message="${item}"]`);
      message.textContent = error[item][0];
    });
  }
  return error;
};
init();
