const multer = require('multer');
const path = require('path');

console.log(" mullter worked  ");


const storage = multer.diskStorage({
    destination:function(req,file,cb){

        console.log("folder----------------------------------");
        console.log(file);
         cb(null,"public/multiple-product-img")
    },
    filename:function(req,file,cb){   
        console.log("filename----------------------------------");
        console.log(file);
        cb(null,file.fieldname+"-"+Date.now()+".jpg")
    }
});

const upload = multer({storage:storage})
    module.exports = upload.array("file2", 1)
// upload.fields([{name:"file1", maxCount: 1},{name:"file2",maxCount:3}])



