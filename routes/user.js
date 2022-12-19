
var express = require('express');


var router = express.Router();

const controller = require("../controller/userController")


function verifyStatus(req, res, next) {
    if (req.session.userBlock) {
        res.redirect("/blocked")
    } else {
        next()
    }
}

function verifylogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login")
    } else {
        next()
    }
}




/* GET home page. */

// home

router.get('/', controller.getHomePage)

// login

router.get("/login", controller.getLoginPage)
router.post("/login", controller.postLoginPage)

// signin

router.get('/signup', controller.getSiginInPage)
router.post("/signup", controller.postSignInPage)

// logout

router.get("/logout", controller.getLogOutPage)

// otp

router.get("/getOtp", controller.getOtpPage)
router.post("/getOtp", controller.postOtpPage)
router.get("/otpVerify", controller.getOtpVerifyPage)
router.post("/otpVerify", controller.postOtpVerifyPage)

//product details

router.get("/productDetailes/:id", verifylogin, verifyStatus, controller.getProductDetailesPage)

// add to cart
router.get("/add-to-cart/:id", verifylogin, verifyStatus, controller.getAddToCartPage)

// cart

router.get("/cart", verifylogin, verifyStatus, controller.getCartPage)

router.post("/coupon", verifylogin, verifyStatus, controller.postCouponPage)

// /change-product-quantity
router.post("/change-product-quantity", verifyStatus, controller.postChangeProductQuantityPage)

// checkout 
router.get("/place-Order", verifylogin, verifyStatus, controller.getCheckOutPage)

// pay pal sucess
router.get("/success", verifyStatus, controller.getSuccessPage)

router.post("/place-Order", verifylogin, verifyStatus, controller.postCheckOutPage)

// order conformation 
router.get("/view-Order", verifylogin, verifyStatus, controller.getViewOrderPage)
router.post("/paypal-change-status", verifylogin, verifyStatus,controller.postPaypalChangeStaus)

// show bills



// /view-order-products

router.get("/view-order-products/:id", verifylogin, verifyStatus, controller.getViewOrderProductsPage)

// verify login

router.post("/verifiy-payment", verifyStatus, controller.postVerifiyPaymentPage)

router.post("/verifyPaypal", verifyStatus, controller.postVerifyStatusPage)

// /cancel-order
router.post("/cancel-order/:id/:item", verifylogin, verifyStatus, controller.postCancelOrderPage)

// my account 
router.get("/My-Account", verifylogin, verifyStatus, controller.getMyAccountPage)

router.get("/My-Account-Addres", verifylogin, verifyStatus,controller.getMyAccountAddresPage)
router.get("/My-Account-new-addresss/:id", verifylogin, verifyStatus, controller.getMyAccountNewAddresss)
router.post("/My-Account-new-addresss", verifylogin, verifyStatus, controller.postMyAccountNewAddresss)
router.get("/My-Account-edit-addresss/:addrs1/:addrs2/:name1/:name2", verifylogin, verifyStatus, controller.getMyAccountEditAddresss)
router.post('/My-Account-edit-addresss', verifylogin, verifyStatus, controller.postMyAccountEditAddresss)
router.get("/my-account-delete-address/:addrs1/:addrs2/:name1/:name2",verifylogin, verifyStatus, controller.getMyAccountDeleteAddress)

// Add-new-addresss

router.get("/Add-new-addresss/:id", verifylogin, verifyStatus, controller.getAddNewAddresss)

// . submit-address

router.post("/Add-new-addresss", verifylogin, verifyStatus, controller.postSubmitAddressPage)

//  user bloked

router.get("/blocked", controller.getBlockedPage)

router.get("/headder", controller.getHeddderPage)

// address
router.get("/Address", verifylogin, verifyStatus, controller.getAddressPage)

router.get("/edit-Address/:addrs1/:addrs2/:name1/:name2", verifylogin, verifyStatus, controller.getEditAddressPage)

router.post("/edit-Address", verifylogin, verifyStatus, controller.postEditAddressPage)

router.get("/delete-Address/:addrs1/:addrs2/:name1/:name2",verifylogin, verifyStatus,controller.postDeleteAddressPage )

// product page

router.get("/products/:id", controller.getProductPage)

// wish list 
router.get("/wishlist", verifylogin, verifyStatus, controller.getWishListUserPage)

router.get("/addWishlist/:id", verifylogin, verifyStatus, controller.getWishListPage)

router.post("/removeWishList/:id", verifylogin, verifyStatus, controller.postRemoveWishList)



//  forget passsword
router.get("/forgot-Password", controller.getForgetPasswordPage)
router.post("/forgot-Password", controller.postForgetPasswordPage)

// change Password

router.get("/change-Password", verifylogin, verifyStatus, controller.getChangePasswordPage)
router.post("/change-password-conform",verifyStatus,verifylogin,controller.getConformPasswordPage)
router.post("/change-pwd-repeatpassword",verifyStatus,verifylogin,controller.getRepeatPasswordPage)

//remove product
router.post("/remove-cart/:id", verifylogin, verifyStatus, controller.postRemoveCart)

// // moolla index
// router.get("/molla-index",verifylogin,verifyStatus,controller.getMollaIndexPage)

// // molla cart
// router.get("/molla-cart",verifylogin,verifyStatus,controller.getMollaCartPage)


module.exports = router;
