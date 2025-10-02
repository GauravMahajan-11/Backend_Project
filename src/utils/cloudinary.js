import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async (localFilePAth) => {
    try{
          if(!localFilePAth) return null
          // upload the file on cloudinary

          const response = await cloudinary.uploader.upload(localFilePAth, {
            resource_type : "auto" 
          })
            fs.unlinkSync(localFilePAth)
          //file uploaded successfully
          //console.log(" FILE UPLOADED ON CLOUDINARY  ", response.url)
          return response;
    }
    catch(err){
        fs.unlinkSync(localFilePAth) //remove the temporry file from local storage as 
        // upload operation failed
        return null
    }
}

export { uploadOnCloudinary }