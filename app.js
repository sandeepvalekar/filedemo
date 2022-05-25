const express = require('express');
const http = require('http');
const bcrypt = require('bcrypt');
const path = require("path");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/UserModel');
const multer=require('multer');

const app = express();
const server = http.createServer(app);

app.use(cors({origin: "http://localhost:3000"})) // Default = CORS-enabled for all origins Access-Control-Allow-Origin: *!
app.use(express.json()) // middleware for parsing application/json
app.use(express.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname,'./public')));


app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,'./public/index.html'));
});


app.post('/register', async (req, res) => {
    try{
        console.log(req.body);
        let user = await User.findOne({ "email": req.body.email });
        if(user){
            return res.status(402).send({ statusCode:402, statusMessage:"User already exist.", resData:{}});
        }
        // let { error } = validateUser(req.body);
        // if (error){
        //     return res.status(403).send({ statusCode:403, statusMessage:error.details[0].message, resData:{}});
        // }
        let data = new User({
            username:req.body.username,
            email:req.body.email,
            password:req.body.password
        });
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
        
        let item = await data.save();
        res.status(200).send({ statusCode:200, statusMessage:"User created successfully.", resData:item });        
    } catch{
        return res.status(500).send({ statusCode:500, statusMessage:error.message, resData:{}});
    }
});

app.post('/login', async (req, res) => {
    try{
        let user = await User.findOne({ "email": req.body.email });
        if(user){
    
            let submittedPass = req.body.password; 
            let storedPass = user.password; 
    
            const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
            if (passwordMatch) {
                res.status(200).send({ statusCode:200, statusMessage:"User logged in successfully.", resData:user }); 
            } else {
                res.status(403).send({ statusCode:403, statusMessage:"Username or password is incorrect.", resData:{} });                 
            }
        }
    } catch{
        return res.status(500).send({ statusCode:500, statusMessage:error.message, resData:{}});
    }
});
// MongoDB connection, success and error event responses
const uri = "mongodb://localhost:27017/FileDemoDB";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log(`Connected to mongo at ${uri}`));

// View Engine Setup
app.set("public",path.join(__dirname,"public"))
app.set("public/uploads",path.join(__dirname,"public/uploads"));
app.set("view engine","ejs")
    
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it
    
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }
  })
       
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
    
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
  
// mypic is the name of file attribute
}).single("mypic");       
  
app.get("/",function(req,res){
    res.render("Signup");
})
    
app.post("/uploadProfilePicture",function (req, res, next) {
        
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req,res,function(err) {
  
        if(err) {
  
            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {
            console.log(req.file);
            console.log(res.file);
            let fileUrl = '/uploads/'+ req.file.filename;
            // SUCCESS, image successfully uploaded
            res.send(`Success, Image uploaded!<br><a download="${req.file.filename}" href="${fileUrl}" title="ImageName">Download Image</a>`)
            
            console.log(fileUrl)
        }

    })
})


function betweenRandomNumber(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }

  console.log(  
    "6 Digit: " + betweenRandomNumber(100000, 999999)
  )

server.listen(3000, function(){
    console.log("server is listening on port: 3000");
});