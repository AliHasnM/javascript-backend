import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"; // JWT for token generation
import bcrypt from "bcrypt"; // bcrypt for password hashing

// Creating the user schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt timestamps
);

// Bcrypt: Password Hash
// pre() me callback function k leye arrow function use krne se problem a sakti hain kue k arrow function me hamary pass this ka reference nhi hota context ka nhi pata hota esy tu pre() ko context ka pata hona bohat zarori hota hai kue k hum jis model par apply kr rahy hain os Object ki values ko access and modify krna hota hai (like userName:{type: String, required: true} wagara)
// kis event par hook ko apply krna hai ye b batana hota hai (validate, save, remove, updateOne, deleteOne, init (note: init hooks are synchronous))
// userSchema.pre("save", () => {}); // not prefer
// Note: Pre-save hook to hash the password before saving the user document
userSchema.pre("save", async function (next) {
  // this reference k leye hai. isModified("string me hi value deni hoti hai") ye predefined function hai
  if (!this.isModified("password")) return next();
  // bcrypt k pass hash(passwordReference, NumberOfRound) function hota hai jis se password ko hash krta
  this.password = await bcrypt.hash(this.password, 10);
  next();
}); // best method

// Compare Password
// methods hamy provide krta hai k hum customs method bana kr add kr sakty. isPasswordCorrect method banaya hum se jo password compare kry ga. bcrypt hi compare(data String, encrypted String) function se password ko compare krde ga
// Note: Method to compare input password with hashed password in database

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// JWT
// Generate Access Token: jwt sign(payload,ACCESS_TOKEN_SECRET,{ACCESS_TOKEN_EXPIRY}) function se token generate kr deta hai.
// Note: Method to generate an access token using JWT

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generate Refresh Token: payload se km information hoti hai es me
// Note: Method to generate a refresh token using JWT

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

// Exporting the User model
export const User = mongoose.model("User", userSchema);

// "User" model will be stored in the database as "users" (pluralized and lowercased)
