var express = require('express');
const session = require('express-session');

const adminHelper = require('../helpers/admin-helper');
const userHelpers =require("../helpers/user-helper")
var router = express.Router();

var productHelpers= require("../helpers/product-helpers");



module.exports={
        getLoginPage:(req,res)=>{
      
        res.render("admin/adminLogin")
    },
    postLoginPage:(req,res)=>{
       
        
            adminHelper.adminLogin(req.body).then((response)=>{
             
                if(response.status){
                
                  req.session.admin=response.user
                  req.session.admin.loggedIn=true
                  res.redirect('/admin')
                }else{
            
                  req.session.loginErr=true
                  res.redirect("/admin/login/")
                }
                
            })
      
    },
    getSignInPage:(req,res)=>{
     res.render("admin/adminSignup")
    },
    postSignInPage:(req,res)=>{
        console.log(req.body);
         adminHelper.doASignup(req.body).then((response)=>{
        res.redirect("/admin/Dashboard")
       })

    },
    getLogoutPage:(req,res)=>{
        console.log("logout");
        req.session.admin=null
        res.redirect("/admin")
    },
    getAdminPage:async(req,res)=>{
        // let user=req.session.user
        // let products=await productHelpers.getRevenue()
        // console.log("----------------",products)
        // products.forEach(element => {
           
        //     if(element.paymentMethod=='RazoPay'){
        //         console.log("---if-------",element.paymentMethod);
        //       element.razopay= parseInt(element.quantity)*parseInt(element.product.price)
        //         console.log("-----element.razopay-----element.razopay----",element.razopay);
        //     }else{
        //         // console.log("---else-------",element.paymentMethod);
        //     }
        // });
        // let totalSalesPrice =await productHelpers.totalSalesPrice()
        let totalOrderCount = await productHelpers.totalOrderCount()
        let totalUser =await productHelpers.totalUserCount()
        let totalSalesByYear =await productHelpers.totalSalesByIncomeYear() 
        // let totalSalesByMonth=await productHelpers.totalSalesByIncomeMonth()
        let totalSalesByDaily =await productHelpers.totalSalesByIncomeDaily()
      

        
        res.render('admin/Dashboard',{totalSalesByYear,totalSalesByDaily,totalOrderCount,totalUser});
    },
    getCustomerPage:(req,res)=>{
        productHelpers.getAllUser().then((user)=>{
      
            res.render('admin/customers',{user});
          })
    },
    getCategoryPage:async(req,res)=>{
        await productHelpers.getCategoryDetails().then((category)=>{
          
            res.render('admin/category',{category});  
            }) 
        
    },
    getProductPage:(req,res)=>{
    
        productHelpers.getAllProducts().then((products)=>{
           
            products.forEach(element => {
                if(element.offer!=0){
                    element.showBanner=true
                }else{
                    element.showBanner=false
                }
            });
            
                res.render('admin/product',{products});
            
          })
    },
    getAddProductPage:async(req,res)=>{
        await productHelpers.getCategoryDetails().then((category)=>{
        
            res.render('admin/add-Products',{category});  
            }) 
          
    //   res.render('admin/add-Products'); 
    },
    postAddProductPage:(req,res)=>{
     
    
        if(req.files){
          
          const files=req.files
          const file =files.map((file)=>{
            return file
          })
          const fileName = file.map((file)=>{
            return file.filename
          })
          const product =req.body
          product.img = fileName
      

            productHelpers.addProduct(product).then((data)=>{
              
                console.log("sucess")
                res.redirect("/admin/Product")
            })
           
            
            
        }else{
            res.send("failed")
        }             
    },
    postProductDeleatePage:(req,res)=>{
        var proId=req.params.id
            console.log(proId);

            productHelpers.deleteProduct(proId).then(()=>{
           
            res.redirect("/admin/product")
  
        })
    },
    getEditProductPage:async(req,res)=>{
        let product =await productHelpers.getProductsDetails(req.params.id)
        let category=await productHelpers.getCategoryDetails()
        console.log("category",category.categoryName);
            let image= product.img
        console.log("product",product,category)
  
 
        console.log(product);
        res.render("admin/edit-product",{product,image,category})
    },
    postEditProductPage:(req,res)=>{
        if(req.files){
         
          const files=req.files
          const file =files.map((file)=>{
            return file
          })
          const fileName = file.map((file)=>{
            return file.filename
          })
          const product =req.body
          product.img = fileName


          productHelpers.updateProduct(req.params.id,product).then(()=>{
            res.redirect("/admin/product")
          })
           
            
            
        }else{
            res.send("failed")
        }  

        
        
       
    },
    getAddCateogaryPage:(req,res)=>{
        if(req.session.admin){
            res.render("admin/add-category")
        }else{
   
            
            res.render("admin/add-category",{"exitCategory":req.session.exitCategory})
            req.session.exitCategory=false
        }

       
    },
    postAddCategoryPage:(req,res)=>{
        console.log(req.body.categoryName);
       

        productHelpers.addCategory(req.body).then((response)=>{
   
           if(response){
             
                console.log("if work");
                res.redirect("/admin/category")
                
           }else{
                console.log("else work");
                req.session.exitCategory=true
                console.log(response);  
                res.redirect("/admin/add-category")
             
            }
       
      })
    },
    postUserBlockPage:(req,res)=>{
        productHelpers.blockUser().then((response)=>{
            console.log(response);
            productHelpers.blockUser(req.params.id).then((response)=>{
                req.session.userBlock=true
          
              res.redirect("/admin/customers")
            }) 
           
          })
    },
    postUserUnblockPage:(req,res)=>{
      
        productHelpers.unblockUser(req.params.id).then((response)=>{
            req.session.userBlock=false
          console.log(response);
          res.redirect("/admin/customers")
        }) 
         
    },
    postCategoryDeleatePage:(req,res)=>{
        var proId=req.params.id
            console.log(proId);

            productHelpers.CategoryDeleate(proId).then(()=>{
           
            res.redirect("/admin/category")
  
        })
    },
    postimageUploadPage:(req,res)=>{
        
        if(req.files){
            
          
            res.send("sucess")
        }else{
            res.send("failed")
        }
        
        
    },
    getFrontImagePage:(req,res)=>{
            console.log(req.body);
            console.log(req.files.Image);
        productHelpers.insertFrontImage(req.body).then((data)=>{
         
        })
            
    },
    getOrderPage:(req,res)=>{
        productHelpers.getOrderListForAdmin().then((order)=>{
            console.log(order);
            res.render("admin/order",{order})
        })
       
    },
    getOrderProductsPage:async(req,res)=>{
        
        let products= await productHelpers.getOrderProducts(req.params.id)
       
    
        
        res.render("admin/view-orded-product",{products})
    },
    postupdateOrderStatusPage:(req,res)=>{
       
        let status = req.body.status
        productHelpers.changeOrderStaus(req.params.id,req.params.item,status).then((response)=>{
            var id=req.params.id
            console.log(" after then   00000    0000000      0000000   000000",req.params.id);
            res.redirect("/admin/order-products/"+id)
        })
        
     
    },
    getImageListPage:(req,res)=>{
        productHelpers.getProductsImages(req.params.id).then((products)=>{
            console.log(products);
         
            let image=products.img
            res.render("admin/image-list",{image})
          })
        
        
    },
    getProductOfferPage:async(req,res)=>{
         
        // res.send("done")
   
       let product=await productHelpers.getPoductPrice(req.params.id)
    
        let  staticPrice=product[0].price;
        req.session.staticPrice=staticPrice
        
            if(product[0].originalPrice==0){
                res.render("admin/add-offer",{product})
            }else{
                offer=true
               let productId=product
              
                res.render("admin/add-offer",{productId})
            }
    },
    postProductOfferPage:(req,res)=>{

       let Offer=req.body.price;
       
    //    let originalPrice=req.session.staticPrice;
       let amount=Offer/100;
       let price=amount*req.session.staticPrice
      
       
       
       let id=req.body.id

       productHelpers.updateOffer(price,id,req.session.staticPrice,Offer).then(()=>{
  
       
        res.redirect("/admin/product")
       })

    },
    getcancelOfferPage:async(req,res)=>{
     
           
           let product=await productHelpers.getPoductPrice(req.params.id)
           let staticPrice=product[0].originalPrice
         productHelpers.cancelOffer(req.params.id,staticPrice).then(()=>{
            res.redirect("/admin/product")
         })
        
       
        
    },
    getcouponPage:(req,res)=>{
        
        res.render("admin/forms")
    },
    postCouponPage:(req,res)=>{
      
        productHelpers.addNewCoupon(req.body).then(()=>{
            res.redirect("/admin/coupon")
        })

       
    },
    getSalesReportPage:async(req,res)=>{
        // let order = await productHelpers.getAllOrders()
        // console.log("---------order----------",order)
        // order.forEach(element => {
        //     console.log("----------------",element.Date);
        //     element.Date= new Date().toLocaleDateString();
        //     console.log("--------||||||||||--------",element.Date);
             

        // });
        // //  let  product = getProductFromOrderCollection()
        let order = await productHelpers.getAllDelivaryProduct()
 
        order.forEach(element => {
            if(element.revenew=='null'){
                element.revenew=parseInt(element.quantity) * parseInt(element.product.price)
                console.log("-----------",element.revenew)
            }
         
        });
       
        res.render("admin/sales-report",{order})
    },
    postSearchSalesReportPage:async(req,res)=>{
       
        let order = await productHelpers.getAllOrderByDate(req.body)
        
        order.forEach(element => {
            
            if(element.revenew=='null'){
                element.revenew=parseInt(element.quantity) * parseInt(element.product.price)
         
            }
           
         
        });
         
            res.render("admin/sales-report-search",{order})
        
       

       
    },
    getAddToBannerPage:async(req,res)=>{
    
      let product=await productHelpers.getBannerProduct(req.params.id)
      res.render("admin/banner",{product})
    },
    postAddToBannerPage:async(req,res)=>{
        let banner = await productHelpers.getBanner()
       
        if(banner.length==0){
            if(req.files){
              
              const files=req.files
              const file =files.map((file)=>{
                return file
              })
              const fileName = file.map((file)=>{
                return file.filename
              })
              const product =req.body
              product.img = fileName
            
    
                productHelpers.addBanner(product).then((data)=>{
                    console.log("sucess")
                  res.redirect("/Product")
                })
               
                
                
            }else{
                res.send("failed")
            }  
        }else{
            productHelpers.removeBanner(banner[0]._id).then(()=>{
                if(req.files){
                    
                  const files=req.files
                  const file =files.map((file)=>{
                    return file
                  })
                  const fileName = file.map((file)=>{
                    return file.filename
                  })
                  const product =req.body
                  product.img = fileName
             
        
                    productHelpers.addBanner(product).then((data)=>{
                      
                        console.log("sucess")
                        res.redirect("/admin/Product")
                    })
                   
                    
                    
                }else{
                    res.send("failed")
                }  
            })
        }

        
    
         
    }
   


}
