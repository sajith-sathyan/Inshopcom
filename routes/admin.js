var express = require('express');

var router = express.Router();
const controller=require("../controller/adminController");

const multer = require("../middleware/multer")
const multerForBanner=require("../middleware/multerForBanner")

function adminLoggin(req,res,next){
    if(!req.session.admin){
        res.redirect('/admin/login')
    }else{
        next()
    }
}



/* GET users listing. */

// login

router.get('/login',controller.getLoginPage )
router.post("/login",controller.postLoginPage)

// sign in

router.get('/signup', controller.getSignInPage)
router.post('/signup', controller.postSignInPage)

// logout

router.get("/logout",controller.getLogoutPage)

// admin

router.get('/',adminLoggin,controller.getAdminPage)

// customers

router.get('/customers',adminLoggin, controller.getCustomerPage)

// category

router.get('/category', adminLoggin,controller.getCategoryPage)

// product

router.get('/product',adminLoggin, controller.getProductPage)

// image list

router.get("/image-list/:id",adminLoggin,controller.getImageListPage)

// addProducts

router.get('/addProducts',adminLoggin,controller.getAddProductPage) 
router.post('/addProducts',adminLoggin,multer, controller.postAddProductPage)

// add theme image
router.post("/front-image",adminLoggin,controller.getFrontImagePage)

// delete Products

router.post("/delete-Products/:id",adminLoggin,controller.postProductDeleatePage)

// edit product

router.get("/edit-product/:id",controller.getEditProductPage)
router.post("/edit-product/:id",adminLoggin,multer,controller.postEditProductPage)

// add category

router.get("/add-category",adminLoggin,controller.getAddCateogaryPage)
router.post("/add-category",adminLoggin,controller.postAddCategoryPage) 
router.post("/delete-category/:id",adminLoggin,controller.postCategoryDeleatePage)   

//  userBlock

router.post("/userBlock/:id",adminLoggin,controller.postUserBlockPage)

// userUnblock

router.post("/userUnblock/:id",adminLoggin,controller.postUserUnblockPage)
  
router.post("/upload", adminLoggin,controller.postimageUploadPage)

// order
router.get("/order",adminLoggin,controller.getOrderPage)

// view order products

router.get("/order-products/:id",adminLoggin,controller.getOrderProductsPage)

// upadate product status

router.post("/change-order-status/:id/:item",adminLoggin,controller.postupdateOrderStatusPage)


// add product offer

router.get("/add-offer/:id",adminLoggin,controller.getProductOfferPage)
router.post("/add-offer",adminLoggin,controller.postProductOfferPage)

// cancel-Offer
router.get("/cancel-Offer/:id",adminLoggin,controller.getcancelOfferPage)

// coupon

router.get("/coupon",adminLoggin,controller.getcouponPage)
router.post("/coupon",adminLoggin,controller.postCouponPage)

// sales report

router.get("/sales-report",controller.getSalesReportPage)
router.post("/search-sales-report",controller.postSearchSalesReportPage)
router.get("/add-To-Banner/:id",adminLoggin,controller.getAddToBannerPage)
router.post("/add-To-Banner",adminLoggin,multerForBanner,controller.postAddToBannerPage)


module.exports = router;
