const multer = require('multer');
const path = require('path');

console.log("middleware worked");


const storage = multer.diskStorage({
    destination:function(req,file,cb){

        console.log(file);
         cb(null,"public/multiple-product-img")
    },
    filename:function(req,file,cb){   
     
        console.log(file);
        cb(null,file.fieldname+"-"+Date.now()+".jpg")
    }
});

const upload = multer({storage:storage})
    module.exports = upload.array("file2", 3)




