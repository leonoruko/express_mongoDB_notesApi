// my notepad app

const express= require("express");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const bcrypt=require("bcryptjs");
const jwt = require("jsonwebtoken");

// const { MongoClient } = require("mongodb");
require('dotenv').config();
const uri=process.env.MONGODB_URI

app=express()
app.use(bodyParser.json())  

// connect to MongoDb
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log("Mongo DB connected"))
    .catch((error)=>console.log(error));

// User Schema
const userSchema= new  mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
})

const User=mongoose.model('User',userSchema)

// Note Schema and model
const noteSchema=new mongoose.Schema({
    title:String,
    content:String,
    date:{
        type:Date,
        default:Date.now
    },
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User',required:true} //Reference to User
})
const Note = mongoose.model('Note',noteSchema)



// Routes

// USER
// user registeration
app.post('/register',async (req,res)=>{
    const {name,email,password}=req.body;
    try{
        const hashedPassword= await bcrypt.hash(password,10);
        const newUser= new User({
            name,email,password:hashedPassword
        });

        await newUser.save();
        res.status(201).json({"message":"User registered successfully"})        
    }
    catch(error){
        res.status(400).json({"error":error.message});
    }
})

// user login
app.post('/login',async (req,res)=>{
    const {email,password} =req.body
    
    try{
        const user =await User.findOne({email});
        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(200).json({error:"Invalid credentials"})
        }

        // Generate JWT token
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'})
        res.json({token})
    }
    catch(error){
        res.status(400).json({error:error.message})
    }

})

// Middleware to authenticate users
const authenticate=(req,res,next)=>{
    const token=req.headers['authorization']?.split(' ')[1] //Bearer token
     if (!token) return res.sendStatus(401);//Unauthorized

     jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403); //Forbidden
        req.user=user; //attatch user info to the request
        next();
     });
};

// NOTES
// create a new note

app.post('/notes',authenticate,async (req,res)=>{
    const {title,content}=req.body;
    const newNote=new Note({
        title,
        content,
        user:req.user.id
    });
    try{
        const savedNote=await newNote.save();
        res.status(201).json(savedNote);
    }
    catch(error){
        res.status(400).json({"error":error.message})
    }
})

app.get("/notes",authenticate,async (req,res)=>{
    try{
        const notes=await Note.find({user:req.user.id});
        res.status(200).json(notes);
    }
    catch(error){
        res.status(400).json({"error":error.message})
    }
})

app.get("/notes/:id",authenticate,async (req,res)=>{
    try{
        const id=req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            res.status(400).json({"error":"Invalid ID format"})
        }
        const note = await Note.findById({_id:id,user:req.user.id});
        if (note) {
            res.status(201).json(note)
        }else{
            res.status(404).json({"error":"Note not found"})
        }
    }
    catch(error){
        res.status(400).json({"error":error.message})
    }

})

app.delete('/notes/:id',authenticate,async (req, res) => {
    try {
      const id = req.params.id;
  
      // Check if the provided ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
  
      // Use findByIdAndDelete to find and delete the note in one step
      const note = await Note.findByIdAndDelete({_id:id,user:req.user.id});
  
      if (note) {
        res.status(200).json({ message: "Note deleted successfully", note });
      } else {
        res.status(404).json({ error: "Note not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



// start server
const PORT =3000
app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})



