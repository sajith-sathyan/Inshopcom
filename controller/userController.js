
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
    console.log("------Banner------",Banner)
    let Category = await productHelpers.getAllcaegeory()
    console.log("-------------Category--------------", Category);
     let wishlistCount=null
    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      console.log("......................................................", cartCount);
     wishlistCount = await userHelpers.getWishListCount(req.session.user._id)
      console.log("---------------wishlistCount-----------",wishlistCount);  
    }

    productHelpers.getAllProducts().then((products) => {
      console.log(".........................................          .....................", products);
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
    console.log("post");
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
      console.log(response);
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
    console.log("-----getOtpPage------");
    if (req.session.user) {
      console.log("-----if------");
      res.render("user/number")
    } else {
      console.log("-----else------");
      res.render("user/number", { "sameNumber": req.session.numberNotExit })
      req.session.numberNotExit = false
    }

  },
  postOtpPage: (req, res) => {
    console.log("//////////////", req.body);
    console.log("::::::::::::::", '+91' + (req.body.number));
    req.session.phone = '+91' + (req.body.number)


    userHelpers.checkMobileNUmber(req.body.number).then((user) => {
      console.log("|||| ||||| |||||", user);

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
    console.log("wwwwwwwwwwwwwwwwww", req.session.phone);
    const otp = req.body.otp
    console.log(".,.,.,.,.,.,.,.,", req.body.otp);
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: req.session.phone, code: otp })
      .then((verification_check) => console.log("VERIFIVATION STATUS", verification_check.status))
      .then(() => res.redirect("/"));
  },
  getProductDetailesPage: (req, res) => {
    productHelpers.getAllProductsForProductDetailes(req.params.id).then(async(product) => {
      let Category = await productHelpers.getAllcaegeory()
      console.log("....../////////.......//././././././././././././././././././././.");
      console.log(product)
      console.log("............................................................");

      //product[0].imgid = product[0].imgid.map(e=>e.filename)  
      // console.log(product[0].imgid)
      //  product=product[0]
      res.render("user/product-detail", { product , user:req.session.user,Category})
    })

  }, getAddToCartPage: (req, res) => {



    console.log("___________________________________api/calling________________", req.params.id);
    userHelpers.AddToCart(req.params.id, req.session.user._id).then((response) => {
      res.json({ status: true })

    })




  }, getCartPage: async (req, res) => {
    


    let product = await userHelpers.getCartProducts(req.session.user._id)
    console.log("product|||||||||||||||||       |||||||||||||||||||||        ||||||||||||||", product);
    totalValue = 0
    

    if (product.length > 0) {

      totalValue = await userHelpers.getTotalAmount(req.session.user)
      console.log("------------------------totalValue-----------------", totalValue);
      console.log("-------------------------user in cart------------", req.session.user);
      if (req.session.couponStatus) {
        console.log("--------------------worked-----------worked----------worked---------", req.session.coupon);
        let couponDetailes = await userHelpers.checkcoupon(req.session.coupon)
        console.log("----------------req.session.coupon----------------------", couponDetailes);
        req.session.copoenFailed = true
        if (couponDetailes[0].PriceStart <= totalValue && couponDetailes[0].Quantity != 0) {
          req.session.copoenFailed = false
          conertToOffer = couponDetailes[0].offer / 100
          amount = conertToOffer * totalValue
          totalValue = amount
          console.log("-------------amount----------------------", amount);
          userHelpers.reduceCoponQuantity(req.session.coupon, couponDetailes[0].Quantity).then(() => {


          })

        }


      }
      console.log("--------------------||----totalValue----||-------------", totalValue);


      //   let total = await userHelpers.getTotalAmount(req.session.user)
      //   console.log("total",total);
      //  let totals=total.total

      req.session.total = totalValue
      console.log(">>>>>>>>>>>>>>>>>> >>>>>>>>>>>> >>>>>>>>>>", req.session.user._id);
      res.render("user/shopping-cart", { product, user: req.session.user, totalValue, "copoenErr": req.session.copoenFailed })
      // req.session.copoenFailed =false
    }

  }, postCouponPage: (req, res) => {
    console.log("------------------", req.body);
    console.log("|||||||||||||||||||||||||||||||||||  postCouponPage  |||||||||||||||||||||||||||||||");
    console.log("___________", req.body.coupon);
    userHelpers.getCouponPage().then((response) => {
      console.log("_--------------coupon-----------------", response);
      response.forEach(element => {
        console.log("------------------", element.coupon);
        if (element.coupon == req.body.coupon) {
          userHelpers.getCouponCollection(req.body.coupon).then((response) => {
            console.log("|||||||||||||||||||||||coupon|||||||||||", response);
            let curretDate = new Date();
            req.session.copoenFailed = true
            console.log("-------------------curretDate-------", curretDate);
            if (response[0].expDate >= curretDate && response[0].dateStart <= curretDate) {
              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++");
              console.log("-----------------------------", element.coupon);
              req.session.coupon = req.body.coupon
              req.session.couponStatus = true
              console.log("-------------------------- req.session.coupon------------", req.session.coupon);
              console.log("----------------------if work----");
              console.log("---------------user----------------------", req.session.user._id);
              req.session.copoenFailed = true
              res.json({ status: true })

            } else {
              console.log("Ooooooooooooooooooooooooooooooooooooooooooooo")
              res.redirect("/cart")
              req.session.copoenFailed = true
            }

          })

        } else {
          req.session.couponStatus = false

          req.session.copoenFailed = true
          console.log("----------------------else work----");
          res.json({ status: false })
        }
      });
    })


  }

  , postChangeProductQuantityPage: (req, res) => {
    userHelpers.ChangeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.session.user)
      console.log("------------||------", response.total)
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
    console.log("_____________________Addresss_________________________________", Addresss);
    // let total = await userHelpers.getTotalAmount(req.session.user)
    let wallet = await userHelpers.getWallet(req.session.user._id)
    console.log("----wallet----wallet-----wallet----wallet----wallet----wallet----", wallet);

    let total = req.session.total
    if (wallet.length != 0) {
      if (total <= wallet[0].Balance) {
        req.session.walletBalance = true
      }
    } else {
      req.session.walletBalance = false
    }
    console.log("./././//././././././././.", total);
    res.render("user/chekout", { total, user: req.session.user, Addresss, "wallet": req.session.walletBalance })
    req.session.walletBalance = false


  },
  postCheckOutPage: async (req, res) => {
    console.log("........................................................", req.body.userId);
    let products = await userHelpers.getCartProductList(req.session.user)
    console.log("products>>>>>>>>>>>", products);
    let totalPrice = req.session.total
    console.log("products", products);
    console.log("totalPrice", totalPrice);
    let order = req.body
    console.log("----- ----------order---------------------------", order);
    userHelpers.placeOrder(order, products, totalPrice).then((orderId) => {
console.log("---------payment--method--------------",req.body['payment-method'] )
      if (req.body['payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      } else if (req.body['payment-method'] === 'PayPal') {
        console.log("::::::::::         ::::::::::::::::              :::::::::::::::::::::::    PayPal Work");
        userHelpers.generatePayPal(order, totalPrice).then((response) => {
          
          let payPal = response;
          payPal.payPal = true;
          res.json(payPal)
        })

      } else if (req.body['payment-method'] === 'Wallet') {

        userHelpers.updateWallet(req.session.user._id, req.session.total)
        res.json({ codSuccess: true })
      }
      else if(req.body['payment-method'] ==='RazoPay') 
        userHelpers.generateRazopay(orderId, totalPrice).then((response) => {
          res.json(response)
        })
      

    }).then(async () => {
      let oreder = await productHelpers.getOrderProducts
    })
    // console.log(".....................*****************...................................",req.body.userId); 
  },
  getViewOrderPage: async (req, res) => {
    //  if(req.session.user){

    console.log("....................      ...................        .................        .....");
    let orders = await userHelpers.getUserOrders(req.session.user._id)
    console.log("----------        ----------        -----------     ------", orders)
    orders.forEach(element => {
      if (element.Date) {
        let date = element.Date
        let dateCut = new Date(date).toLocaleDateString()
        console.log("---------dateCut-----dateCut-------dateCut-------dateCut------dateCut---", dateCut);
        element.Date = dateCut
      }
    });
    res.render('user/viewOrder', { user: req.session.user, orders })
    console.log("***********<><<><<><><><><>" + orders[0]);
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
    res.render("user/View-Order-Products", { user: req.session.user, products })

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

    console.log("....................................................................", req.params.id);
    userHelpers.canceProduct(req.params.id, req.params.item).then(async (response) => {
      products = await userHelpers.getProductCollection(req.params.item)
      order = await userHelpers.getOrderCollection(req.params.id)
      console.log("------order---order------order----order", order[0].paymentMethod);

      console.log("-----------products----products------products---------", products);

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
    console.log("--------userDetials-----",userDetials)
    res.render("user/myAccount", { user: req.session.user,userDetials })
  },
  getAddNewAddresss: (req, res) => {
    res.render("user/add-new-Address")
  },
  postSubmitAddressPage: (req, res) => {
    console.log("______________________             ____________________________     _____", req.session.user._id);

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
    console.log("--------------------------", req.params.id)
    console.log("---------product---------product-------------", product)
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

    console.log("___________________________________api/calling________________", req.params.id);
    userHelpers.AddToWishList(req.params.id, req.session.user._id).then((response) => {
      res.json(response)
    })
  },

  getForgetPasswordPage: (req, res) => {

    res.render("user/forgotPassword")
  },
  postForgetPasswordPage: (req, res) => {
    console.log("-------req.body------", req.body)
    res.send("post")
  },
  getChangePasswordPage: (req, res) => {
    res.render("user/changePassword",{"wrongPassword":req.session.wrongPassword})
   
  },
 
  postRemoveCart: (req, res) => {
    console.log("remove cart--------workk")

    console.log("--------------------------------", req.body.proId)
    console.log("-------------remove cart work-------------------")
    userHelpers.removeCart(req.body.proId, req.session.user._id).then((response) => {
      console.log("responce---------here");
      res.json(response)
    })

  }, getWishListUserPage: async (req, res) => {
    
    let wishlist=await userHelpers.getAllWishLIst(req.session.user._id)
   
    
      console.log("------------------||------------",wishlist)
    let product = await userHelpers.getWishListProducts(req.session.user._id)
    console.log("product|||||||||||||||||       |||||||||||||||||||||        ||||||||||||||", product);
    totalValue = 0
    console.log("---------------", product)
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
   

    res.render("user/wishList", { product ,"emptyWishList":req.session.emptyWishList})
    
    
  },
  postRemoveWishList: (req, res) => {
      console.log("---------------",req.params.id)
      userHelpers.removeWishlist(req.params.id,req.session.user._id).then((response)=>{
        res.json(response)
      })  
  },
  postVerifyStatusPage:(req,res)=>{
   console.log("postVerifyStatusPage---------payapal -----work-----")
  },
  getEditAddressPage:async(req,res)=>{
   
    console.log("--------------",req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2)
    let Addresss = await userHelpers.getSpecifAdressDetailes(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2)
    console.log("_____________________Addresss_________________________________", Addresss);
        res.render("user/edit-address",{Addresss})
  },
  postEditAddressPage:(req,res)=>{
    console.log("---------------------",req.body)

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
    res.render('user/view-address',{Addresss,user:req.session.user})
  },
  getMyAccountNewAddresss:(req,res)=>{
    res.render("user/my-account-new-address")
  },
  postMyAccountNewAddresss:(req,res)=>{
    userHelpers.addAdress(req.body,req.session.user._id).then((response)=>{
      res.redirect("/My-Account-Addres")
    })
  },
  getMyAccountEditAddresss:async(req,res)=>{
    let Addresss = await userHelpers.getSpecifAdressDetailes(req.session.user._id,req.params.addrs1,req.params.addrs2,req.params.name1,req.params.name2)
    res.render('user/my-account-edit-address',{Addresss})
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
     console.log("---getConformPasswordPage-----");
    console.log("_______",req.body.password)
    await userHelpers.validatePassword(req.body.password,req.session.user._id).then((response)=>{
      if(response){
        console.log("-----if work-----")
        res.render("user/change-pwd-repeatpassword")  
      }else {
        console.log("--------else work")
        res.json(response)
      }
    })
  },
  getRepeatPasswordPage:(req,res)=>{
     console.log("------",req.body.password);
     userHelpers.updatePassword(req.session.user._id,req.body.password).then((responce)=>{
      
      res.json(responce)
     })
  },
  postPaypalChangeStaus:(req,res)=>{
     console.log("post Paypal ChangeStaus--|||||||    |||||||||      |||||||||||||--------",req.body)

  }

  

 
}