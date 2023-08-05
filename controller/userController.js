
var express = require('express');
;
var router = express.Router();
const userHelpers = require("../helpers/user-helper")
var productHelpers = require("../helpers/product-helpers")
var db = require('../config/dbconnect')
var Razorpay = require("razorpay")
require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOCKEN;
const verifySid = process.env.VERIFY_SID;
const client = require('twilio')(accountSid, authToken);
const paypal = require('paypal-rest-sdk');






// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': process.env.PAYPAL_CLIENT_ID,

//   'client_secret': process.env.PAYPAL_CLIENT_SECRET
// });


module.exports = {
  getHomePage: async (req, res) => {
    let Banner= await productHelpers.getBanner()
  
    let Category = await productHelpers.getAllcaegeory()
 
     let wishlistCount=null
    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      
     wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
     
      let wishlist=await userHelpers.getAllWishLIst(req.session.user._id)
   
    
     
    let product = await userHelpers.getWishListProducts(req.session.user._id)
  
    }

    productHelpers.getAllProducts().then((products) => {

      products.forEach(element => {
        if (element.Quantity == 0) {
          element.stockErr = true
        } else {
          element.stockErr = false
        }
      });
      products.forEach(element => {
        if (element.offer != 0) {
          element.OfferErr = true
        } else {
          element.OfferErr = false
        }
      });
        

      let user = req.session.user

      res.render('user/index', { products, user,wishlistCount, cartCount, Category,Banner  });
    })
  },
  getLoginPage: (req, res) => {
    if (req.session.user) {
      res.render("user/login")
    } else {
      res.render("user/login", { "loginErr": req.session.userloggedIn })
      req.session.userloggedIn = false
    }

  },
  postLoginPage: (req, res) => {
   
    userHelpers.doLogin(req.body).then((response) => {

      console.log("userStatus", response.userStatus);
      if (response.status || response.userStatus) {


        req.session.user = response.user
        req.session.user.status = response.userStatus
        req.session.user.loggedIn = true

        res.redirect('/')

      } else {

        req.session.loginErr = true
        req.session.userloggedIn = true
        res.redirect("/login")
      }

    })
  },
  getSiginInPage: (req, res) => {
    res.render("user/signup", { "sameEamil": req.session.sameEmail });
    req.session.sameEmail = false
  },
  postSignInPage: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
  
      if (response.email) {
        req.session.sameEmail = true
        res.redirect("/signup")
      } else {
        req.session.loggedIn = true
        req.session.user = req.body
        res.redirect("/")
      }
    })
  },
  getLogOutPage: (req, res) => {
    req.session.user = null
    res.redirect('/')
  },
  getOtpPage: (req, res) => {
    
    if (req.session.user) {
      
      res.render("user/number")
    } else {
     
      res.render("user/number", { "sameNumber": req.session.numberNotExit })
      req.session.numberNotExit = false
    }

  },
  postOtpPage: (req, res) => {
   
   


    userHelpers.checkMobileNUmber(req.body.number).then((user) => {
     

      let number = req.body.number
      let existNumber = user.mobile
      if (existNumber === number) {

        client.verify.v2
          .services(verifySid)
          .verifications.create({ to: '+91' + (req.body.number), channel: "sms" })
          .then((verification) => console.log(verification.status))
          .then((data) => {
            res.redirect("/otpVerify")
          })

      } else {
        console.log("not go verift");
        req.session.numberNotExit = true
        res.redirect("/getOtp")
      }
    })
  },
  getOtpVerifyPage: (req, res) => {
    res.render("user/verifyOtp")
  },
  postOtpVerifyPage: (req, res) => {
    
    const otp = req.body.otp
  
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: req.session.phone, code: otp })
      .then((verification_check) => console.log("VERIFIVATION STATUS", verification_check.status))
      .then(() => res.redirect("/"));
  },
  getProductDetailesPage: (req, res) => {
    productHelpers.getAllProductsForProductDetailes(req.params.id).then(async(product) => {
      let Category = await productHelpers.getAllcaegeory()
    
      console.log(product)
      
      let wishlistCount=null
    let cartCount = null
   
    

      //product[0].imgid = product[0].imgid.map(e=>e.filename)  
      // console.log(product[0].imgid)
      //  product=product[0]
      res.render("user/product-detail", { product , user:req.session.user,Category,cartCount,wishlistCount})
    })

  }, getAddToCartPage: (req, res) => {



  
    userHelpers.AddToCart(req.params.id, req.session.user._id).then((response) => {
      res.json({ status: true })

    })




  }, getCartPage: async (req, res) => {
     
    
  

    let product = await userHelpers.getCartProducts(req.session.user._id)

    totalValue = 0
    

    if (product.length > 0) {

      totalValue = await userHelpers.getTotalAmount(req.session.user)
   
      if (req.session.couponStatus) {
       
        let couponDetailes = await userHelpers.checkcoupon(req.session.coupon)
       
        req.session.copoenFailed = true
        if (couponDetailes[0].PriceStart <= totalValue && couponDetailes[0].Quantity != 0 && couponDetailes[0].PriceEnd >= totalValue  ) {
          req.session.copoenFailed = false
          conertToOffer = couponDetailes[0].offer / 100
          amount = conertToOffer * totalValue
          totalValue = amount
        
          userHelpers.reduceCoponQuantity(req.session.coupon, couponDetailes[0].Quantity).then(() => {


          })

        }


      }


      //   let total = await userHelpers.getTotalAmount(req.session.user)
      //   console.log("total",total);
      //  let totals=total.total

      req.session.total = totalValue
      let wishlistCount=null
      let cartCount = null
     
        cartCount = await userHelpers.getCartCount(req.session.user._id)
       
       wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
      res.render("user/shopping-cart", { product, user: req.session.user, totalValue, "copoenErr": req.session.copoenFailed ,cartCount,wishlistCount} )
     
    }

  }, postCouponPage: (req, res) => {
   
  
    userHelpers.getCouponPage().then((response) => {
     
      response.forEach(element => {
       
        if (element.coupon == req.body.coupon) {
          userHelpers.getCouponCollection(req.body.coupon).then((response) => {
           
            let curretDate = new Date();
            req.session.copoenFailed = true
           
            if (response[0].expDate >= curretDate && response[0].dateStart <= curretDate) {
             
              req.session.coupon = req.body.coupon
              req.session.couponStatus = true
            
              req.session.copoenFailed = true
              res.json({ status: true })

            } else {
           
              res.redirect("/cart")
             
             
            }

          })

        } else {
          req.session.couponStatus = false

          req.session.copoenFailed = true

          res.json({ status: false })
        }
      });
    })


  }

  , postChangeProductQuantityPage: (req, res) => {
    userHelpers.ChangeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.session.user)
    
      if (response.total == 0) {
        response.status = true
      } else {
        response.status = true
      }
      res.json(response)

    })
  },
  getCheckOutPage: async (req, res) => {

    let Addresss = await userHelpers.getAdressDetailes(req.session.user._id)

    // let total = await userHelpers.getTotalAmount(req.session.user)
    let wallet = await userHelpers.getWallet(req.session.user._id)


    let total = req.session.total
    if (wallet.length != 0) {
      if (total <= wallet[0].Balance) {
        req.session.walletBalance = true
      }
    } else {
      req.session.walletBalance = false
    }
    cartCount = await userHelpers.getCartCount(req.session.user._id)
   
   wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
    console.log("./././//././././././././.", total);
    res.render("user/chekout", { total, user: req.session.user, Addresss, "wallet": req.session.walletBalance, cartCount,wishlistCount})
    req.session.walletBalance = false


  },
  postCheckOutPage: async (req, res) => {
   
    let products = await userHelpers.getCartProductList(req.session.user)
   
    let totalPrice = req.session.total
    console.log("products", products);
    console.log("totalPrice", totalPrice);
    let order = req.body
    
    userHelpers.placeOrder(order, products, totalPrice).then((orderId) => {

      if (req.body['payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      } if (req.body['payment-method'] === 'PayPal') {
        
        userHelpers.generatePayPal(order, totalPrice).then((response) => {
          
          let payPal = response;
          payPal.payPal = true;
          res.json(payPal)
        })

      } if (req.body['payment-method'] === 'Wallet') {

        userHelpers.updateWallet(req.session.user._id, req.session.total)
        res.json({ codSuccess: true })
      }
       if(req.body['payment-method'] ==='RazoPay') 
        userHelpers.generateRazopay(orderId, totalPrice).then((response) => {
          res.json(response)
        })
      

    }).then(async () => {
      let oreder = await productHelpers.getOrderProducts
    })
   
  },
  getViewOrderPage: async (req, res) => {
    //  if(req.session.user){


    let orders = await userHelpers.getUserOrders(req.session.user._id)
 
    orders.forEach(element => {
      if (element.Date) {
        let date = element.Date
        let dateCut = new Date(date).toLocaleDateString()
      
        element.Date = dateCut
      }
    });
   let cartCount = await userHelpers.getCartCount(req.session.user._id)
    
  let wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
    res.render('user/viewOrder', { user: req.session.user, orders ,cartCount,wishlistCount})

    for (var i = 0; i < orders.length; i++) {
      console.log(orders[i].delivaryDetails);
    }
    // }else{
    //   res.redirect("/login")
    // }

  },
  getOrderBillPage: (req, res) => {
    if (req.session.user) {
      res.render("user/showBill")
    } else {
      res.redirect("/login")
    }

  },
  getViewOrderProductsPage: async (req, res) => {
    let products = await userHelpers.getOrderProducts(req.params.id)
    console.log("products", products);
    products.forEach(element => {
      if (element.status == "cancel") {
        element.statusErr = true
      } else {
        element.statusE = false
      }
    });
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    
  let wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
    res.render("user/View-Order-Products", { user: req.session.user, products ,cartCount,wishlistCount})

  },
  postVerifiyPaymentPage: (req, res) => {
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log("payment sucess");
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" })
    })
  },
  postCancelOrderPage: async (req, res) => {

    userHelpers.canceProduct(req.params.id, req.params.item).then(async (response) => {
      products = await userHelpers.getProductCollection(req.params.item)
      order = await userHelpers.getOrderCollection(req.params.id)
    



      if (order[0].paymentMethod != "COD") {
        userHelpers.addToWallet(req.session.user._id, products[0].price).then(() => {

        })
      }




      let id = req.params.id
      res.redirect("/view-order-products/" + id)
    })
  },
  getSuccessPage: (req, res) => {
    res.redirect("/view-Order")
  },
  getMyAccountPage: async(req, res) => {

    let userDetials = await userHelpers.getMyAccountUser(req.session.user._id)

  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
    res.render("user/myAccount", { user: req.session.user,userDetials,cartCount,wishlistCount})
  },
  getAddNewAddresss:async (req, res) => {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render("user/add-new-Address",{cartCount,wishlistCount})
  },
  postSubmitAddressPage: (req, res) => {
  

    //   console.log(req.body);
    //   let orderObj = {
    //     delivaryDetails: {
    //         address: order.FirstName + "" + order.LastName + ","
    //             + order.StreetAddress1 + "" + order.StreetAddress2 + ","
    //             + order.Postcode + "," + order.Country,
    //         mobile: order.Phone,
    //         email: order.Email
    //     },

    // }
    userHelpers.addAdress(req.body, req.session.user._id).then((response) => {
      res.redirect("/place-Order")
    })

  },

  getBlockedPage: (req, res) => {
    res.render("user/userblocked")
  }, getHeddderPage: (req, res) => {
    res.render("user/hedder")
  },
  getAddressPage: (req, res) => {
    res.render("user/address")
  },
  getProductPage: async (req, res) => {
    let Category = await productHelpers.getAllcaegeory()
    let product = await productHelpers.getAllCategoryProduct(req.params.id)

    let title = req.params.id
    product.forEach(element => {
      if (element.Quantity == 0) {
        element.stockErr = true
      } else {
        element.stockErr = false
      }
    });
    product.forEach(element => {
      if (element.offer != 0) {
        element.OfferErr = true
      } else {
        element.OfferErr = false
      }
    });
    
      
      
     
    res.render("user/viewCategoryProduct", { Category, product, title, user: req.session.user })
  },
  getWishListPage: (req, res) => {
    let obj = {}

    userHelpers.AddToWishList(req.params.id, req.session.user._id).then((response) => {
      res.json(response)
    })
  },

  getForgetPasswordPage: (req, res) => {

    res.render("user/forgotPassword")
  },
  postForgetPasswordPage: (req, res) => {
    res.send("post")
  },
  getChangePasswordPage: async(req, res) => {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render("user/changePassword",{"wrongPassword":req.session.wrongPassword,cartCount,wishlistCount})
   
  },
 
  postRemoveCart: (req, res) => {

    userHelpers.removeCart(req.body.proId, req.session.user._id).then((response) => {
      res.json(response)
    })

  }, getWishListUserPage: async (req, res) => {
    
    let wishlist=await userHelpers.getAllWishLIst(req.session.user._id)
   
    
    let product = await userHelpers.getWishListProducts(req.session.user._id)
    console.log("product|||||||||||||||||       |||||||||||||||||||||        ||||||||||||||", product);
    totalValue = 0
    


    product.forEach(element => {

      if (element.product.Quantity != 0) {
        
        element.stockErr = false
      } else {
        element.stockErr = true
      }
    });
    // if(wishlist.length!=0){
    //     let array=wishlist[0].products 
    // console.log("-----------",array);
    // if(array.length==0){
    //  req.session.emptyWishList=true
    // }else{
    //  req.session.emptyWishList=true
    // } 
    // }else{
    //   req.session.emptyWishList=false
    // }
   

    res.render("user/wishList", { product ,"emptyWishList":req.session.emptyWishList, user:req.session.user})
    
    
  },
  postRemoveWishList: (req, res) => {
      userHelpers.removeWishlist(req.params.id,req.session.user._id).then((response)=>{
        res.json(response)
      })  
  },
  postVerifyStatusPage:(req,res)=>{
  },
  getEditAddressPage:async(req,res)=>{
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
     let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    let Addresss = await userHelpers.getSpecifAdressDetailes(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2)
        res.render("user/edit-address",{Addresss,cartCount,wishlistCount})
  },
  postEditAddressPage:(req,res)=>{

    userHelpers.updateAddress(req.body,req.session.user._id).then((response)=>{
     res.redirect('/place-Order')
    })
  },
  postDeleteAddressPage:async(req,res)=>{
    req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2
   await userHelpers.deleteAddres(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2).then((response))
    {
      res.redirect('/place-Order')
    }
    
  },
  getMyAccountAddresPage:async(req,res)=>{
    let Addresss = await userHelpers.getAdressDetailes(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render('user/view-address',{Addresss,user:req.session.user,wishlistCount})
  },
  getMyAccountNewAddresss:async(req,res)=>{
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render("user/my-account-new-address",{cartCount,wishlistCount})
  },
  postMyAccountNewAddresss:(req,res)=>{
    userHelpers.addAdress(req.body,req.session.user._id).then((response)=>{
      res.redirect("/My-Account-Addres")
    })
  },
  getMyAccountEditAddresss:async(req,res)=>{
    let Addresss = await userHelpers.getSpecifAdressDetailes(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render('user/my-account-edit-address',{Addresss,cartCount,wishlistCount})
  },
  postMyAccountEditAddresss:(req,res)=>{
    userHelpers.updateEditedAddress(req.body,req.session.user._id).then((response)=>{
      res.redirect("/My-Account-Addres")
    })
  },
  getMyAccountDeleteAddress:async(req,res)=>{
    await userHelpers.deleteMyAccountAddres(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2).then((response)).then((response)=>{
      res.redirect("/My-Account-Addres")
    })

  },
  getConformPasswordPage:async(req,res)=>{
    await userHelpers.validatePassword(req.body.password,req.session.user._id).then((response)=>{
      if(response){
        res.json({status:true})
        // res.redirect("/change-pwd-repeatpassword")
      }else {
        res.json({status:false})
        
       
      }
    })
  },
  postRepeatPasswordPage:(req,res)=>{
     userHelpers.updatePassword(req.session.user._id,req.body.password).then((responce)=>{
      
      res.json(responce)
     })
  },
  postPaypalChangeStaus:async(req,res)=>{

  },
  getRepeatPasswordPage:async(req,res)=>{
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishListCount(req.session.user._id,cartCount)
    res.render("user/change-pwd-repeatpassword",{cartCount,wishlistCount}) 
  },
  getMollaIndexPage:async(req,res)=>{
    let wishlist=await userHelpers.getAllWishLIst(req.session.user._id)
   
    
    let product = await userHelpers.getWishListProducts(req.session.user._id)
    console.log("product|||||||||||||||||       |||||||||||||||||||||        ||||||||||||||", product);
    totalValue = 0
    product.forEach(element => {
      if (element.product.Quantity < 0) {
        element.outOfstock = true
      } else {
        element.outOfstock = false
      }
    });
    product.forEach(element => {
      
    });
    
    product.forEach(element => {
      if (element.Quantity == 0) {
        element.stockErr = true
      } else {
        element.stockErr = false
      }
    });
    let Banner= await productHelpers.getBanner()
    let Category = await productHelpers.getAllcaegeory()
     let wishlistCount=null
    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
     wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
    }

    productHelpers.getAllProducts().then((products) => {
      products.forEach(element => {
        if (element.Quantity == 0) {
          element.stockErr = true
        } else {
          element.stockErr = false
        }
      });
      products.forEach(element => {
        if (element.offer != 0) {
          element.OfferErr = true
        } else {
          element.OfferErr = false
        }
      });


      let user = req.session.user
     

      res.render('user/index00', { products, user,wishlistCount, cartCount, Category,Banner,product  });
    })
  }

  

 
}
