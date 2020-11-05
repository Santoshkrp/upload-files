

const express = require('express');
const bodyParser=require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
const mongodb=require('mongodb');


const fs=require('fs');

//use the middel ware of body parser

app.use(bodyParser.urlencoded({extended:true}))

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    filename:function(req,file,cb1){
        cb1(null,file.fieldname +'-'+ Date.now() + path.extname(file.originalname));
        //cb is call back fuction which take error,file-name dir to which we want to upload files
    }
})

var upload = multer({
    storage:storage
})

var uploadimg = multer({
  storage:storage,
  limits:{
    fileSize: 1024 * 1024 *2
  }
})




//config mongodb

const MongoClinet = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClinet.connect(url,{
    useUnifiedTopology:true,useNewUrlParser:true},
    (err,client)=>{
        if(err) return console.log(err);

        db=client.db('images')

        app.listen(3000,()=>{
            console.log("listning at port 3000")
        })

})


//config the router

app.get('/',(req,res)=>{

    res.sendFile(__dirname + '/index.html');
});

//configure the uploasd files

app.post("/uploadfile" , upload.single('myFile'),(req,res,next)=>
{
  const file = req.file;
  if(!file){
    const error =new Error ("Please upload a file now");
    error.httpStatusCode=400;
    return next(error); 
  }

  
  

  res.send(file);
}
)


//configure the mulitple file routes

app.post('/uploadmultiple' ,upload.array('myFiles',12),(req,res,next)=>
{
  const files = req.files;
  if(!files){
    const error=new Error("please upload files");
    error.httpStatusCode = 400;
    return next(error);
  }
 res.send(files);

 
})


//upload photos

app.post("/uploadphoto",uploadimg.single('myImage'),(req,res)=>{
  var img = fs.readFileSync(req.file.path); //grabing the image

  var encode_image=img.toString('base64'); //image into string

  

  //define a json object 
  var finalImg={
    contentType:req.file.mimetype,
    path:req.file.path,
    image:new Buffer(encode_image, 'base64')
  };


  //insert the image to the database in mongodb
  db.collection('image').insertOne(finalImg,(err,result)=>{

    console.log(result);
    if(err) return console.log(err);

    console.log("saved to the database to " + file.path);
    res.contentType(finalImg.contentType);
    res.send(finalImg.image); //show the image after uploading
    

  })
})





  
  






app.listen(5000,()=> {
    console.log("server is listening at port 5000");

})