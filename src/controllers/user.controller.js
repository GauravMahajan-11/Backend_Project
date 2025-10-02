import {asyncHandler} from '../utils/asyncHandler.js'; 
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessTokenAndRefreshToken = async (userId) => 
{    try{
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave : false })

      return { accessToken, refreshToken }
}
catch(error){
           throw new  ApiError(500," SOMETHING WENT WRONG WHILE CREATING TOKENS !!! ")
      }
}

const registerUser = asyncHandler(async (req, res) => {
      // get user details from frontend
      // validation - not empty
      // check if user already exists: username , email
      // check for images and avataor 
      // upload to cloudinary
      // create user objectand - create entry in db
      // remove password & refresh token field from response
      //check for user creation
      //return response

      const { fullName, email, username, password } = req.body
      //console.log("email :",email)

      if(
            [fullName, email, username, password].some((field) => field?.trim()==="") 
      ){
          throw new ApiError(400," ALL FIELDS ARE MANDATORY !!! ")
      };
    
      const existedUser = await User.findOne({
            $or:[ {email}, {username}]
      })

      if(existedUser){
            throw new ApiError(409," USER WITH EMAIL OR USERNAME ALREADY EXISTS !!! ")
      }

      const avatarLocalPath =  req.files?.avatar?.[0]?.path
     // const coverImageLocalPath  = req.files?.coverImage?.[0]?.path
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length > 0) {
     
            coverImageLocalPath = req.files.coverImage[0].path;
      };

      if( !avatarLocalPath ){
            throw new ApiError(400," AVATAR IS MANDATORY !!! ")
      }
   
      const avatar = await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

      if (!avatar ) {
             throw new ApiError(400," AVATAR IS MANDATORY !!! ")
      }

      const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),

      })
        
     const createdUser =  await User.findById(user._id).select("-password -refreshToken");

     if (!createdUser ) {
             throw new ApiError(500," SOMETHING WENT WRONG WHILE REGISTERING THE USER !!! ")
      }

      return res.status(201).json(
            new ApiResponse(200,createdUser,"User Registered Successfully ! ")
      )
} )

const loginUser = asyncHandler(async (req, res) => {

      //req body ->data
      //user or email
      //check if user exists
      // check for password
      //generate access token and refresh token
      //send cookie

      const {username ,email, password} = req.body

      if(!(username || email)){

            throw new ApiError(400," USERNAME OR EMAIL IS REQUIRED !!! ") 
      }

    const user  = await User.findOne({
            $or:[{email},{username}]
            
      })

   if(!user){
      throw new ApiError(404," USER DOES NOT EXIST !!! ") 
   }


const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401," INVALID CREDENTIALS !!! ") 
   }

   const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly : true,
      secure : true
     
   }

   return res.status(200)
             .cookie("accessToken", accessToken, options)
             .cookie("refreshToken", refreshToken, options)
             .json( 
               new ApiResponse(200,  {   user : loggedInUser, accessToken, refreshToken }  , 
              "USER LOGGED IN SUCCESSFULLY ! ") 
                  )
} )  

const logoutUser = asyncHandler(async (req, res) => {


      await User.findByIdAndUpdate(req.user._id, 
            { $set: { refreshToken : undefined } },
            { new : true }
      )

      const options = {
      httpOnly : true,
      secure : true
     
   }

   return res.status(200)
                  .clearCookie("accessToken", options)
                  .clearCookie("refreshToken", options)
                  .json(new ApiResponse(200, {}, "USER LOGGED OUT SUCCESSFULLY ! "))
      
})
 

export {registerUser,loginUser,logoutUser}