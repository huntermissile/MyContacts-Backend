const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { Error } = require("mongoose");

// @desc Register a User
// @route POST /api/users/register
// @access public

const registerUser = asyncHandler (async (req,res) =>{
    const {username, email, password } = req.body;
    if(!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory! ");
    }
    const userAvailable = await UserActivation.findOne({email});
    if (userAvailable) {
        res.status(400);
        throw new Error("User already Registered! ");
    }

    // Hash Password
    const hashedPassword = await bcrypt(password, 10);
    console.log("Hashed Password: ", hashedPassword);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    console.log(`User created ${user}`);

    if(user){
        res.status(201).json({_id: user.id,email: user.email });
    }else{
        res.status(400);
        throw new Error("User data is not Valid");
    }
    res.json({message: "Register the user"});
});
  

// @desc Login a User
// @route POST /api/users/login
// @access public

const loginUser = asyncHandler (async (req,res) =>{
    const { email, password } =  req.body;
    if(!emial || !password) {
        res.status(400);
        throw new Error("All fields are mandatory")
    }
    const user = await User.findOne({email});

    // Comapre password with hashedPassword
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.name,
                email : user.email,
                id: user.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m"}
    );
        res.status(200).json({accessToken});
    } else {
        res.status(401);
        throw new Error("Email or Password is not valid");
    }
});


// @desc Current User info
// @route POST /api/users/current
// @access private

const currentUser = asyncHandler (async (req,res) =>{
    res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };