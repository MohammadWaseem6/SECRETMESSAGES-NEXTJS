import mongoose, { Mongoose, Document, Schema } from "mongoose";

// Message Interface
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
// Message Schema
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },

});


// User Interface
export interface User extends Document {
  username: string,
  email: string,
  password: string,
  verifyCode: string,
  verifyCodeExpiry: Date,
  isVerified: boolean,
  isAcceptingMessage: boolean,
  messages: Message[],


}

// User Schema

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"]
  },

  password: {
    type: String,
    required: [true, "Please enter a  password"]
  },
  verifyCode: {
    type: String,
    required: [true, "Please enter a verify code"],
    default: null,
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Please enter a verify code expiry"],
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,

  },
  isAcceptingMessage: {
    type: Boolean,
    default: false,
  },
  messages: [MessageSchema],
});


const UserModel = (mongoose.models.User as mongoose.Model<User>) ||
 (mongoose.model<User>("User",UserSchema));

export default UserModel;