import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";


export interface IUser extends Document {
  _id:string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;

}

const UserSchema:Schema = new Schema ({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // No duplicate emails allowed
    lowercase: true, // Convert to lowercase automatically
    trim: true, // Remove spaces
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true 
});

UserSchema.pre<IUser>('save', async function(next) {
  console.log('🔐 Hashing password for user:', this.email);
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    console.log('💡 Password not modified, skipping hash');
    return next();
  }
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('🔍 Comparing password for user:', this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🎯 Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing password:', error);
    return false;
  }
};

UserSchema.index({ createdAt: -1 }); 

export default mongoose.model<IUser>('User',UserSchema)