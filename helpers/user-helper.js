const db = require("../config/dbconnect");
const collection = require("../config/connection");
const bcrypt = require('bcrypt');
// const { response } = require("../app");
const objectId = require("mongodb").ObjectID
const Razorpay = require('razorpay');
require('dotenv').config()
// const { Promise } = require("mongodb");
// // const { resolve } = require("path");
// // const { reject } = require("promise");
const paypal = require('paypal-rest-sdk');










;

function pal() {
    paypal.configure({
        mode: "sandbox", //sandbox or live
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret:process.env.PAYPAL_CLIENT_SECRET,
    });
}


// var instance = new Razorpay({
//     key_id: process.env.RAZOPAY_KEY_ID,
//     key_secret: process.env.RAZOPAY_KEY_SECRET,
// });

    module.exports = {
    /* doSignup: (userData) => {
         console.log(userData);
         
         return new Promise(async (resolve, reject) => {
             userData.password = await bcrypt.hash(userData.password, 10)
             db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                 resolve(data)
             })
             
         })
     },*/
    doLogin: (userData) => {
        console.log("do login", userData.email);

        return new Promise(async (resolve, reject) => {
            console.log("do login");
            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            console.log(">>>>>>>>>>>");
            //  
            let userStatus = await db.get().collection(collection.USER_COLLECTION).findOne({ status: userData.status })


                //  console.log("-------user.email---userData.email--",user.email,userData.email)
                 console.log("-------user.email-----",user.email)

            if (user.email === userData.email && user.status === 'unblock') {
                console.log(">>>>>>>>>>> ..>>>>>>>>>>>>>>>>");
                bcrypt.compare(userData.password, user.password).then((status) => {
                    console.log("----------status----",status);
                    if (status) {
                        console.log("login success")
                           response.user = user
                        response.status = true
                        resolve(response)
                        response.status = true
                    } else {
                        console.log("login failed000")

                        resolve({ status: false }, response.status = false)
                    }
                })
            } else {
                console.log("login failed111")

                resolve({ status: false })
            }
        }).catch((err) => {
            console.log(" doLogin err", err);
        })
    },
    doSignup: (userData) => {
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })

            if (user) {
                response.email = true
                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(() => {
                    response.user = user
                    resolve(response)
                })
            }
        }).catch((err) => {
            console.log("doSignup", err);
        })

    },
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        }).catch((err) => {
            console.log("getAllUser", err);
        })

    },
    checkMobileNUmber: (userData) => {
        console.log("ffffffffffffffff", userData);
        let response = {}
        return new Promise(async (resolve, rejects) => {
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userData})
            console.log("mmmmmmmmmm", user);

            resolve(user)




        }).catch((err) => {
            console.log("checkMobileNUmber err", err);
        })

    },
    
    AddToCart: async (proId, userId) => {
        console.log("----------proID------------proID--------proID---------proID-------proID-----proID--", proId);
        product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objectId(proId) }).toArray()
        console.log("----------proID------------proID--------proID---------proID-------proID-----proID--", product[0].price);


        let proObj = {
            item: objectId(proId),
            quantity: 1,
            status: "pending",
            price: product[0].price

        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log("proExist", proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { "products.$.quantity": 1 }
                            }
                        ).then(() => {
                            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                            ,

                        ).then((response) => {
                            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                            resolve()
                        }).catch((response) => {
                            console.log("response>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", response);
                        })
                }   
            } else {
                products = [proObj]
                let cartObj = {
                    user: objectId(userId),
                    products
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        }).catch((err) => {
            console.log("AddToCart err", err);
        })
    },
    getCartProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: "$products.status"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, status: "pending", product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(cartItems)
        }).catch((err) => {
            console.log("getCartProducts err", err);
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        }).catch((err) => {
            console.log("getCartCount err", err);
        })
    },
    ChangeProductQuantity: (details) => {
        console.log("--------------------details------------",details.count)
        details.count = parseInt(details.count)
        console.log("details.count", details.count);

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {

                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { "products.$.quantity": details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })

            }

        }).catch((err) => {
            console.log("ChangeProductQuantity err", err);
        })
    },
    getTotalAmount: (userId) => {
        console.log("..............          ...............           ..........", userId);
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId._id) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } }
                    }
                }

            ]).toArray()

            console.log("ooooooooooooooooooooooo", total);


            let ttl = total[0].total
            resolve(ttl)


        }).catch((err) => {
            console.log("getTotalAmount err", err);
        })
    },
    placeOrder: (order, products, total) => {
        console.log("---------------order['payment-method']----------- ",order['payment-method'] )
        return new Promise((resolve, reject) => {
            console.log("***********", order, products, total);
            if (order['payment-method'] == "COD") {
                products.forEach(element => {
                    console.log("--------product . ststus---", element.status);
                    if (element.status == 'pending') {
                        element.status = "palced"
                    } else {
                        element.status = 'pending'
                    }

                });
            }

            console.log("--------------------------order----------")

            let orderObj = {
                delivaryDetails: {
                    address: order.FirstName + ""
                        + order.LastName + ","
                        + order.StreetAddress1 + ""
                        + order.StreetAddress2 + ","
                        + order.Postcode + ","
                        + order.Country + ","
                        + order.TownCity + ","
                        + order.StateCounty,

                    mobile: order.Phone,
                    email: order.Email

                },


                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                Date: new Date(),

            }
            console.log("________________________________________________________________________________");
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteMany({ user: objectId(order.userId) })
                resolve(response.insertedId)
            }).then(async () => {

                let Product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: products[0].item }).toArray()
                console.log("||||||||||  product.Quantity   |||||||||   product.Quantity  |||||||||||  product.Quantity ||||||||||", Product[0].Quantity);
                console.log("||||||||||  product[0].quantity   |||||||||   product[0].quantity  |||||||||||  product[0].quantity ||||||||||", products[0].quantity);

                let stock = parseInt(Product[0].Quantity) - parseInt(products[0].quantity)
                console.log("||||||||||  stock   |||||||||   stock  |||||||||||  stock ||||||||||", stock);
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: products[0].item },
                    {
                        $set: {
                            "Quantity": stock
                        }
                    }
                )
            })
        }).catch((err) => {
            console.log("placeOrder err", err);
        })
    },
    getCartProductList: (userId) => {
        console.log("getCartProductList");
        console.log(userId);
        return new Promise(async (resolve, rejects) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId._id) })
            console.log("cart>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + cart.products);
            resolve(cart.products)
        }).catch((err) => {
            console.log("getCartProductList err", err);
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("==============================" + userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find({ userId: objectId(userId) }).sort({ Date: -1 }).toArray()
            //  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   "+orders)
            resolve(orders)
        }).catch((err) => {
            console.log("getUserOrders", err);
        })
    },
    getOrderProducts: async (orderId) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   " + orderId)
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, status: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log("orderItems", orderItems);
            resolve(orderItems)
        }).catch((err) => {
            console.log("getOrderProducts err", err);
        })
    },
    generateRazopay: (orderId, total) => {
        console.log(".........................generateRazopay work....." + orderId);
        return new Promise((resolve, reject) => {
            var instance = new Razorpay({ key_id: process.env.RAZOPAY_KEY_ID, key_secret: process.env.RAZOPAY_KEY_SECRET })

            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    for (let i = 0; i <= err.length; i++) {
                        console.log("eroorr......" + err[i]);
                    }
                } else {
                    console.log("....................", order);
                    resolve(order)
                }

            });

        }).catch((err) => {
            console.log("generateRazopay err", err);
        })
    },
    verifyPayment: (details) => {
        console.log("verifyPayment");
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZOPAY_KEY_SECRET);

            hmac.update(details['payment[razopay_order_id]'] + "|" + ['payment[razopay_payment_id]']);
            console.log(hmac.digest('hex'));

            if (hmac == ['payment[razopay_signature]']) {
                resolve()
            } else {
                reject()
            }

        }).catch((err) => {
            console.log("erorr", err);
        })
    },
    changePaymentStatus: (orderId) => {
        console.log("changePaymentStatus", orderId);
        console.log("----------------order--------", orderId);
        return new Promise(async (resolve, reject) => {
            //     console.log("--------------change order ststus -----------",orderId);
            //    let order= await db.get().collection(collection.ORDER_COLLECTION).find({_id:objectId(orderId)}).toArray()
            //    let array=order[0].products
            //    console.log("----array---------",array);
            //   array.forEach(element => {
            //     console.log("--------------element array------",element.status);
            //     if(element.status=='pending'){
            //         element.status='placed'
            //     }
            //   }) 

            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        "products.$[].status": 'placed'
                    }
                }
            ).then((response) => {
                console.log("responce", response);
                resolve(response)

            })


        }).catch((err) => {
            console.log("changePaymentStatus err", err);
        })
    },
    canceProduct: async (orderId, proId) => {
        return new Promise(async(resolve,reject)=>{
            console.log("canceProduct", proId);
        await db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: objectId(orderId), "products.item": objectId(proId) },
                {
                    $set: {
                        "products.$.status": "cancel"
                    }
                }).then(() => {
                    resolve()
                })
        })

    },
    generatePayPal: async (orderId, total) => {
        console.log("----------generatePayPal------")
        pal();
        return new Promise((resolve, reject) => {
            var create_payment_json = {
                intent: "sale",
                payer: {
                    payment_method: "paypal",
                },
                redirect_urls: {
                    return_url: process.env.SUCCESS_URL||"http://localhost:3000/success/",
                    cancel_url: process.env.CANCEL_URL||"http://localhost:3000/cancel",
                },
                transactions: [
                    {
                        item_list: {
                            items: [
                                {
                                    name: "inshopcom",
                                    sku: "001",
                                    price: 5,
                                    currency: "USD",
                                    quantity: 1,
                                },
                            ],
                        },
                        amount: {
                            currency: "USD",
                            total: 5,
                        },
                        description: "safest method",
                    },
                ],
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                console.log('called')
                if (error) {
                    console.log('_______________________error_________________', error);

                    throw error;
                } else {
                    console.log('______________________payment ______________', payment);

                    resolve(payment);
                }
            });
        });
    },
    addAdress: (Address, id) => {

        return new Promise((resolve, reject) => {
            console.log("++++++++||||||||||||||+++++++++++++||||||||||++++++++++++++|||||||||||||||++++++++");

            console.log(">>>>>>>>>>>>      >>>>>>>>>>>>>>>     >>>>>>", Address);

            let AddressObj = {
                // + order.Postcode + "," + order.Country+","+order.TownCity+","
                //             +order.StateCounty,

                FirstName: Address.FirstName,
                LastName: Address.LastName,
                StreetAddress1: Address.StreetAddress1,
                StreetAddress2: Address.StreetAddress2,
                Postcode: Address.Postcode,
                TownCity: Address.TownCity,
                StateCounty: Address.StateCounty,
                Country: Address.Country,

                Phone: Address.Phone,
                Email: Address.Email,
                user: objectId(id)

            }


            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(AddressObj).then((response) => {
                console.log("++++++++   +++++++++++++           ++++++++++++++                  ++++++++");
                resolve(response)
                reject
            })

        })

    },
    getAdressDetailes: (id) => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: objectId(id) }).toArray()
            resolve(response)
        })

    },
    getCouponPage: () => {
        return new Promise((resolve, reject) => {
            let coupon = db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    getCouponCollection: (couponName) => {
        return new Promise((resolve, reject) => {
            let coupon = db.get().collection(collection.COUPON_COLLECTION).find({ coupon: couponName }).toArray()
            resolve(coupon)

        })

    }, checkcoupon: (couponName) => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.COUPON_COLLECTION).find({ coupon: couponName }).toArray()
            resolve(response)
        }
        )

    },
    reduceCoponQuantity: (couponName, Quantity) => {
        return new Promise((resolve, reject) => {
            let currentQuantity = Quantity - 1
            db.get().collection(collection.COUPON_COLLECTION).updateOne({ coupon: couponName },
                {
                    $set: {
                        'Quantity': currentQuantity
                    }
                }
            ).then(() => {
                resolve()
            })
        })

    },
    getProductCollection: (item) => {

        console.log("------------item----------item-----------------item-----------", item);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objectId(item) }).toArray().then((response) => {
                // console.log("------------products----------products-----------------products-----------",response); 
                resolve(response)
            })

        })
    },
    addToWallet: (userId, price) => {
        return new Promise(async (resolve, reject) => {
            let walletObj = {
                user: userId,
                Balance: price
            }
            let wallet = await db.get().collection(collection.WALLET_COLLECTION).find({ user: userId }).toArray()


            // let user=toString( wallet[0].user)
            // console.log("----------wallet-----------wallet-------------wallet--------",wallet[0].user);

            if (wallet.length != 0) {
                console.log("-------------------------", wallet[0].Balance);
                let amount = parseInt(wallet[0].Balance) + parseInt(price)
                console.log("----------amount-------amount-----amount---", amount);
                console.log("---------if-----------worked--------");
                db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: userId },
                    {
                        $set: {
                            "Balance": amount
                        }
                    }
                ).then(() => {
                    resolve()
                }).catch((err) => {
                    console.log("addToWallet-----if-----", err);
                })
            } else {
                console.log("----------else--------------work----------");
                db.get().collection(collection.WALLET_COLLECTION).insertOne(walletObj).then(() => {
                    resolve()
                }).catch((err) => {
                    console.log("--addToWallet-----else-----", err);
                })

            }


        })



    },
    getOrderCollection: (orderId) => {
        console.log("---------------getOrderCollection-----------------------");
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
            console.log("------------------------response----------------", response);
            resolve(response)
        })

    },
    getWallet: (user) => {
        console.log("---------getWallet-------getWallet--------------getWallet------");
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.WALLET_COLLECTION).find({ user: user }).toArray().then((response) => {
                console.log("----------response-------response----------response----", response);
                resolve(response)
            })

        })
    },

    updatePassword: (userId,passsword ) => {

        console.log("---------userId--------------userId------", userId);
        return new Promise(async (resolve, reject) => {
            let userPassword = await bcrypt.hash(passsword, 10)
            console.log("");
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        'password': userPassword,
                        'status':"unblock"
                    }
                }
            ).then((response) => {
                console.log("response", response);
                resolve(response)
            })
        })

    },
    removeCart: (proId, userId) => {
        console.log("----------product id----------------", proId)
        console.log("----------product id----------------", userId)
        return new Promise(async(resolve,reject)=>{
            let cart =await db.get().collection(collection.CART_COLLECTION).find({user:objectId(userId)}).toArray()
            console.log("-----wishList-------",cart);
             console.log("-----------",cart[0].products);
            let array=cart[0].products
            console.log("------------------arry.lenght-",array.length)
            let index = array.findIndex(product => product.item == proId)
            console.log("-------",index);
            if (array.length!=1) {
              db.get().collection(collection.CART_COLLECTION).update  (
                {
                    user:objectId(userId)
                },
                {
                    $pull:{
                        'products':{
                            'item':objectId(proId)
                        }
                    }
                }
              ).then((responce)=>{
                console.log(responce);
                resolve({status:true})
              })   
            
            }else{
                resolve({lastProduct:true})
            }
    
            
           
         })

    },
    AddToWishList: async (proId, userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("----------proID------------proID--------proID---------proID-------proID-----proID--", proId);
            product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objectId(proId) }).toArray()
            console.log("----------proID------------proID--------proID---------proID-------proID-----proID--", product[0].price);


            let proObj = {
                item: objectId(proId),
                name: product[0].ProductName,
                price: product[0].price,
                Quantity:product[0].Quantity,
                Date:new Date()

            }

            let userCart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log("proExist", proExist);
                if (proExist != -1) {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        // .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        //     {
                        //         $inc: { "products.$.quantity": 1 }
                        //     }
                        // ).then(() => {
                        //     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                        //     resolve()
                        // })
                        console.log("-----------prouct-exist------------");
                        resolve()
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                            ,

                        ).then((response) => {
                            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                            resolve(response)
                        }).catch((response) => {
                            console.log("response>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", response);
                        })
                }
            } else {
                console.log("--------------------else------else-----------");
                products = [proObj]
                let cartObj = {
                    user: objectId(userId),
                    products
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })

            }
        }).catch((err) => {
            console.log("AddToCart err", err);
        })

    },
    getWishListProducts:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let WishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: "$products.status"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, status: "pending", product: { $arrayElemAt: ['$product', 0] }
                    }
                }
               

            ]).toArray()
            resolve(WishlistItems)
        }).catch((err) => {
            console.log("getCartProducts err", err);
        })
    },
    removeWishlist:(proId,userId)=>{
     return new Promise(async(resolve,reject)=>{
        let wishList =await db.get().collection(collection.WISHLIST_COLLECTION).find({user:objectId(userId)}).toArray()
        console.log("-----wishList-------",wishList);
         console.log("-----------",wishList[0].products);
        let array=wishList[0].products
        let index = array.findIndex(product => product.item == proId)
        console.log("-------",proId);
        if (index>-1) {
          db.get().collection(collection.WISHLIST_COLLECTION).update  (
            {
                user:objectId(userId)
            },
            {
                $pull:{
                    'products':{
                        'item':objectId(proId)
                    }
                }
            }
          ).then((responce)=>{
            console.log(responce);
            resolve(responce)
          })   
        
        }

        
       
     })
    },
    getWishListCount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        }).catch((err) => {
            console.log("getWishlistCount err", err);
        }) 
    },
    getAllWishLIst:(userId)=>{
        console.log("---getAllWishLIst");
        return new Promise(async(resolve,reject)=>{
            let wishList = await db.get().collection(collection.WISHLIST_COLLECTION).find({user:objectId(userId)}).toArray()
            console.log("---------||______",wishList)
            
            resolve(wishList)
            
        })
    },
   
    getSpecifAdressDetailes:(userId,addrs1,addrs2,name1,name2)=>{
        // req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2
        return new Promise(async(resolve,reject)=>{
          let address = await  db.get().collection(collection.ADDRESS_COLLECTION).find({user:objectId(userId),StreetAddress1:addrs1,StreetAddress2:addrs2,FirstName:name1,LastName:name2}).toArray()
          resolve(address)
        })
    },
    updateAddress:(address,userId)=>{
        console.log("--------updateAddress------",address.FirstName)
        
         return new Promise(async(resolve,reject)=>{
            // ,'StreetAddress1':address.FirstName,'StreetAddress2':address.LastName,'FirstName':address.FirstName,'LastName':address.LastName
            db.get().collection(collection.ADDRESS_COLLECTION).updateMany({'user':objectId(userId),'FirstName':address.NONEDITEDFirstName,'LastName':address.NONEDITEDLastName,'StreetAddress1':address.NONEDITEDStreetAddress1,'StreetAddress2':address.NONEDITEDStreetAddress2},
            {
                $set:{
                    'FirstName':address.FirstName,
                    'LastName':address.LastName,
                    'CompanyName':address.CompanyName,
                    'Country':address.Country,
                    'StreetAddress1':address.StreetAddress1,
                    'StreetAddress2':address.StreetAddress2,
                    'TownCity':address.TownCity,
                    'StateCounty':address.StateCounty,
                    'Postcode':address.Postcode,
                    'Phone':address.Phone,
                    'Email':address.Email,
                    'user':objectId(userId)
                }
            }
            ).then((responce)=>{
              console.log("-------------||--------",responce)
                resolve(responce)
            })
         })
    },
    deleteAddres:(userId,addrs1,addrs2,name1,name2)=>{
        console.log("-------deleteAddres----");
      return new Promise(async(resolve,reject)=>{
       await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({'StreetAddress1':addrs1,'StreetAddress2':addrs2,'FirstName':name1,'LastName':name2,'user':objectId(userId)})
       .then((responce)=>{
            console.log("-------responce-------",responce)
            resolve(responce)
        })
      })
    },updateEditedAddress:(address,userId)=>{
        return new Promise(async(resolve,reject)=>{
            // ,'StreetAddress1':address.FirstName,'StreetAddress2':address.LastName,'FirstName':address.FirstName,'LastName':address.LastName
            db.get().collection(collection.ADDRESS_COLLECTION).updateMany({'user':objectId(userId),'FirstName':address.NONEDITEDFirstName,'LastName':address.NONEDITEDLastName,'StreetAddress1':address.NONEDITEDStreetAddress1,'StreetAddress2':address.NONEDITEDStreetAddress2},
            {
                $set:{
                    'FirstName':address.FirstName,
                    'LastName':address.LastName,
                    'CompanyName':address.CompanyName,
                    'Country':address.Country,
                    'StreetAddress1':address.StreetAddress1,
                    'StreetAddress2':address.StreetAddress2,
                    'TownCity':address.TownCity,
                    'StateCounty':address.StateCounty,
                    'Postcode':address.Postcode,
                    'Phone':address.Phone,
                    'Email':address.Email,
                    'user':objectId(userId)
                }
            }
            ).then((responce)=>{
              console.log("-------------||--------",responce)
                resolve(responce)
            })
         })
    },
    deleteMyAccountAddres:(userId,addrs1,addrs2,name1,name2)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({'StreetAddress1':addrs1,'StreetAddress2':addrs2,'FirstName':name1,'LastName':name2,'user':objectId(userId)})
            .then((responce)=>{
                 console.log("-------responce-------",responce)
                 resolve(responce)
             })
           })
    },
    getMyAccountUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            let user = db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId)}).toArray()
              resolve(user)
        })
    },
    validatePassword:(password,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let originalPassword= await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            console.log("-------",originalPassword)
            bcrypt.compare(password, originalPassword.password).then((responce)=>{
                resolve(responce)
                console.log("responce-----",responce)
            })
        })
    
    }
    
    









}
