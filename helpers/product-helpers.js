const db = require("../config/dbconnect");
const collection = require("../config/connection");
var Razorpay = require("razorpay")

// const { Promise } = require("mongodb");
// // const { resolve } = require("promise");
// // const { Promise } = require("mongodb");


const objectId = require("mongodb").ObjectID

module.exports = {
    /*addProduct:(product,callback)=>{
        console.log("product helpers",product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(true)
        })
    },*/
    addProduct: (product) => {
        console.log("product ", product);
        // console.log("imagid",imgid);
        // paths = imgid.map(e=>e.filename)
        console.log();
        console.log("data in function addProducts");
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insert(product).then((data) => {
                console.log("data here", data);
                resolve(data)
            })

        }).catch((err) => {
            console.log("addProduct err", err);
        })
    },
    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        }).catch((err) => {
            console.log("getAllProducts err", err);
        })
    },
    getAllUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        }).catch((err) => {
            console.log("getAllUser err", err);
        })
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                console.log("inside resolve");
                console.log("data", response);
                resolve(response)
                console.log("after resolve");
            })
        }).catch((err) => {
            console.log("deleteProduct err", err);
        })

    },
    getProductsDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        }).catch((err) => {
            console.log("getProductsDetails err", err);
        })
    },
    updateProduct: (proId, proDetails) => {
        console.log("????????????????????         ????????/", proDetails.img);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        ProductName: proDetails.productName,
                        price: proDetails.price,
                        category: proDetails.category,
                        discription: proDetails.discription,
                        img: proDetails.img
                    }

                }).then(() => {
                    console.log(objectId(proId));
                    resolve()
                }).catch((err) => {
                    console.log("updateProduct err", err);
                })
        })
    },
    addCategory: (category) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let verifyCategory = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            let status = true;
            for (var i = 0; i < verifyCategory.length; i++) {
                console.log("verifyCategory in array", verifyCategory[i].categoryName);
                if (category.categoryName == verifyCategory[i].categoryName) {
                    console.log("::::::::::::::::::;", category.categoryName);
                    status = false;

                }
            }
            if (status) {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data) => {
                    console.log("data here", data.insertedId);
                    response.status = true
                    resolve(response.status)
                })
            } else {
                response.status = false
                console.log("alerady exist");
                resolve(response.status)

            }
        }).catch((err) => {
            console.log("addCategory err", err);
        })
    },
    getCategoryDetails: () => {
        return new Promise((resolve, reject) => {
            var category = db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)



        }).catch((err) => {
            console.log("getCategoryDetails err", err);
        })
    },
    blockUser: (proId) => {
        return new Promise((resolve, rejects) => {
            console.log("unloblock fiunction pro id", objectId(proId));
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: { status: "blocked" }
            }).then((response) => {
                resolve(response)
                console.log("-======================================    ", response);
            }).catch((err) => {
                console.log("blockUser err", err);
            })
        })

    },
    unblockUser: (proId) => {
        console.log("unblockUser");
        console.log(proId);
        return new Promise((resolve, rejects) => {
            console.log("unloblock fiunction pro id", objectId(proId));
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: { status: "unblocked" }
            }).then((response) => {
                resolve(response)
                console.log("-======================================    ", response);
            }).catch(() => {
                console.log("unblockUser err", err);
            })
        })

    },
    CategoryDeleate: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                console.log("inside resolve");
                console.log("data", response);
                resolve(response)
                console.log("after resolve");
            })
        }).catch((err) => {
            console.log("CategoryDeleate err", err);
        })

    },
    getAllProductsForProductDetailes: (proId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((products) => {
                resolve(products)
            })

        }).catch((err) => {
            console.log("getAllProductsForProductDetailes err", err);
        })
    },
    insertFrontImage: (image) => {
        return new Promise((resolve, reject => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(image).then((data) => {
                resolve(data)
            })
        })).catch((err) => {
            console.log("insertFrontImage err", err);
        })

    },
    getOrderListForAdmin: () => {
        return new Promise((resolve, reject) => {
            let order = db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            console.log("order", order);
            resolve(order)
        }).catch((err) => {
            console.log("getOrderListForAdmin err", err);
        })
    },
    changeOrderStaus: async (orderId, proId, status) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId), "products.item": objectId(proId) },
                    {
                        $set: {
                            "products.$.status": status
                        }
                    }).then((response) => {

                        resolve(response)
                    })

        }).catch((err) => {
            console.log("changeOrderStaus err", err);
        })


    },
    getProductsImages: async (proId) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
            resolve(products)
        }).catch((err) => {
            console.log("getProductsImages err", err);
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
    getPoductPrice: (proId) => {
        console.log("__________________________getPoductPrice____________________________");
        return new Promise(async (resolve, reject) => {
            console.log("_______________________________step 3_______________________");
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find(objectId(proId)).toArray()

            resolve(product)

        })

    },
    updateOffer: (offerPrice, id, originlPrice,offer) => {
        console.log("____________offer__________", offer)
        console.log("____________id__________", id)
        console.log("____________id__________", id)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(id) },
                {
                    $set: {
                        price: offerPrice,
                        originalPrice: originlPrice,
                        offer:offer
                        
                    }
                }
            ).then(() => {
                console.log("_________________|||||||||||||||________");
                resolve()
            }).catch((err) => {
                console.log("___________________ERR________", err);
            })
        })
    },
    cancelOffer: (proId, price) => {
        console.log("_____________price__________", price);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) },
                {
                    $set: {
                        price: price,
                        originalPrice: 0,
                        offer:0
                    }
                }

            ).then(() => {
                resolve()
            })
        })
    },
    addNewCoupon: (coupon) => {
        const couponObj = {
            coupon: coupon.coupon,
            PriceStart: coupon.priceStart,
            offer: coupon.offer,
            Quantity: coupon.Quantity,
            Discription: coupon.Discription,
            dateStart: new Date(coupon.dateStart),
            expDate: new Date(coupon.dateEnd)

        }
        console.log("--------", coupon.dateStart);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponObj).then(() => {
                resolve()
            })
        })

    },
    getAllcaegeory: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(response)
        })
    },
    getAllCategoryProduct: (categoryName) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: categoryName }).toArray()
            resolve(products)
        })

    },
    addwishlist: (proId, userId) => {
        console.log("-------addwishlist-----------addwishlist---------addwishlist")
        return new Promise((resolve, reject) => {
            let wishlistObj = {
                'user': userId,
                'product': proId
            }

            db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                resolve(response)
            })
        })

    },
    getWishlist: (userId) => {
        console.log("------------getWishlist--------------");
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.WISHLIST_COLLECTION).find({ 'user': userId }).toArray()
            resolve(response)

        })
    },
    updateWishList: (proId, userId) => {
        return new Promise(async(resolve, reject) => {
            console.log("------------updateWishList------------");
            let wishListUser = await db.get().collection(collection.WISHLIST_COLLECTION).find({ 'user': userId }).toArray()
            console.log("-----wishListUser-------wishListUser--------wishListUser------", wishListUser[0].product);
            // let array = wishListUser.product
            // console.log("---------Array----------Arry---------", array);
            console.log("---------Array----------Arry---------", proId);
            wishListUser.forEach(element => {
                console.log("-----element--------element---",element);
                if (element.product == proId ) {
                    console.log("------------productExist-------productExist-------productExist");
                    WishlistStatus = false
                    
                }
                else {
                    console.log("---------------userId-----userId-----------userId----", userId)
                    db.get().collection(collection.WISHLIST_COLLECTION).find({ 'user': userId }).insertOne({'product':proId})
                        
                    
                    
                }
            });
            
        })
    },getAllOrders:()=>{
        return new Promise((resolve,reject)=>{
            let responce=  db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(responce)
        })
     
    },
    getAllDelivaryProduct:()=>{
         return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'products':{
                            $elemMatch:{
                                'status':'Delivary'
                            }
                        }
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status',
                        paymentMethod:'$paymentMethod',
                        Date:'$Date',
                        revenew:'null'

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
                        item: 1, quantity: 1, status: 1,paymentMethod:1,Date:1, revenew:1,product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            // console.log("orderItems", orderItems);
            resolve(orderItems)
        }).catch((err) => {
            console.log("err", err);
        })
    },
    getAllOrderByDate:(date)=>{
        console.log("--------getAllOrderByDate--------getAllOrderByDate--------")
        let start = new Date(date.dateStart)
        let end =  new Date(date.dateEnd)
        console.log(start);
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and:[
                            {
                            Date:{
                                $gte:start
                            }
                        },
                        {
                            Date:{
                                $lte:end
                            } 
                        }
                    ]
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status',
                        paymentMethod:'$paymentMethod',
                        Date:'$Date',
                        revenew:'null'

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
                        item: 1, quantity: 1, status: 1,paymentMethod:1,Date:1, revenew:1,product: { $arrayElemAt: ['$product', 0] }
                    }
                },

                {
                    $match:{
                        status:'Delivary'   
                    }
                }

            ]).toArray()
            console.log("orderItems", orderItems);
            resolve(orderItems)
        }).catch((err) => {
            console.log("getOrderProducts err", err);
        })
    },
    getRevenue:()=>{
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'products':{
                            $elemMatch:{
                                'status':'Delivary'
                            }
                        }
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status: '$products.status',
                        paymentMethod:'$paymentMethod',
                        Date:'$Date',
                        razopay:'null',
                        paypal:"null",
                        cod:'null'

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
                        item: 1, quantity: 1, status: 1,paymentMethod:1,Date:1, revenew:1,razopay:1,paypal:1,cod:1,product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            // console.log("orderItems", orderItems);
            resolve(orderItems)
        }).catch((err) => {
            console.log("err", err);
        })
    },
    totalSalesPrice:()=>{
      
    },
    totalOrderCount:()=>{
        console.log("------totalOrderCount------")
        return new Promise(async(resolve,reject)=>{
            let totalOrder= await db.get().collection(collection.ORDER_COLLECTION).estimatedDocumentCount()
            resolve(totalOrder)
        })
    },
    totalUserCount:()=>{
        console.log("-----------totalUserCount------");
        return new Promise(async(resolve,reject)=>{
            let totalUser = await db.get().collection(collection.USER_COLLECTION).estimatedDocumentCount()
            resolve(totalUser)
        })
    },
    totalSalesByIncomeYear:()=>{
        console.log("----------totalSalesByIncomeYear----");
        return new Promise(async(resolve,reject)=>{
            let incomeByYear=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'products.status':'Delivary'
                    }
                },
                {
                    $group:{
                        _id:{
                            $dateToString:{
                                format:"%Y",date:'$Date'
                            }
                        }
                    }
                },
                {
                    $sort:{
                        _id:1
                    }
                }
            ]).toArray()
            resolve(incomeByYear)
        })
    },
   
    totalSalesByIncomeDaily:()=>{
       return new Promise(async(resolve,reject)=>{
        let incomeByDaily = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    'products.status':'Delivary'
                }
            },
            {
                $group:{
                    _id:{
                        day:{
                            $dayOfYear:'$Date'
                        },
                        year:{
                            $year:'$Date'
                        }
                        
                        
                    },
                    total:{
                        $sum:"$totalAmount"
                    }
                    
                    
                }
            },
            {
                $sort:{
                    _id:1
                }
            }
        ]).toArray()
        resolve(incomeByDaily)
       }) 
    },
    addBanner:(product)=>{
        console.log("addBanner")
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(product).then((responce)=>{
                console.log(responce);
                resolve(responce)
            })
        })
    },
    getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let Banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(Banner)
        })
    },
    getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let banner= await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    removeBanner:(BannerId)=>{
         return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(BannerId)}).then((responce)=>{
                console.log("------responce---",responce);
                resolve(responce)
            })
         })
    },
    getBannerProduct:(proId)=>{
      return new Promise(async(resolve,reject)=>{
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
        console.log("-----product----",product);
        resolve(product)
      })
    }







}