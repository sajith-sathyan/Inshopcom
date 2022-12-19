const db=require("../config/dbconnect");
const collection=require("../config/connection");
const bcrypt=require('bcrypt');




module.exports={
    adminLogin:(userData)=>{
        console.log("hello________________________________________________________");
       return new Promise(async(resolve,rejects)=>{
        let response={}
        let user=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:userData.email})
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    resolve({status:false})
                }
            })
        }else{
            resolve({status:false})
        }
       }).catch((err)=>{
            console.log("adminLogin err",err);
       })
    },
    doASignup: (userData) => { 
       
            return new Promise(async(resolve,rejects)=>{
                userData.password = await bcrypt.hash(userData.password,10)
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(userData).then((data)=>{
                    resolve(data)
                })
            }).catch((err)=>{
                console.log("doASignup err",err);
            })
        
    
    },
    getAdminOrderProducts:(orderId)=>{
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id:   objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status:'$products.status'
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
                        item: 1, quantity: 1,status:1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log("orderItems",orderItems);
            resolve(orderItems)
            reject("getAdminOrderProducts log reject")
        }).catch((err)=>{
          console.log("getAdminOrderProducts",err);
        })  
    }
   
}