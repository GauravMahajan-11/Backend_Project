import {asyncHandler} from '../utils/asyncHandler.js'; 
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


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
      console.log("email :",email)

      if(
            [fullName, email, username, password].some((field) => field?.trim()==="") 
      ){
          throw new ApiError(400," ALL FIELDS ARE MANDATORY !!! ")
      };

      const existedUser = User.findOne({
            $or:[ {email}, {username}]
      })

      if(existedUser){
            throw new ApiError(409," USER WITH EMAIL OR USERNAME ALREADY EXISTS !!! ")
      }

      const avatarLocalPath =  req.files?.avatar[0]?.path
      const coverImageLocalPath  = req.files?.coverImage[0]?.path

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


export {registerUser}