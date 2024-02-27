const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register a user
//@route POST /user/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const {username, email, password } = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error ("All field are mandatory");
    }

    const userAvailable = await User.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User Already Registered");
    }

    // Hash Password

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);
    
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    console.log(`User created ${user}`);

    if(user){
        res.status(201).json({_id: user.id, email: user.email});
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
    res.json({message: "Register the user"});
});

//@desc Login a user
//@route POST /user/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body
    if(!email || ! password){
        res.status(400);
        throw new Error ("All field are mandatory");
    }
    const user = await User.findOne({email});
    // compare password with hashedpassword
    if (user && (await bcrypt.compare( password, user.password))){
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id,
            },
        });
        res.status(200).json({accessToken});
    }
    
    
    res.json({message: "Login user"});
});


//@desc current user information
//@route POST /user/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json({message: "Current user information"});
});

module.exports = {registerUser, loginUser, currentUser}