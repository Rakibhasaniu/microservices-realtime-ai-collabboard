import User from "../model/User";
import { jwtUtils, JWTPayload } from "../utils/jwt";
import { sessionUtils } from "../utils/redis";

export interface RegisterUserInput {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  token?: string;
}

export class UserService {
  async registerUser(userData: RegisterUserInput): Promise<AuthResponse> {
    console.log("🚀 ~ UserService ~ registerUser ~ userData:", userData)
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }
      const newUser = new User({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        avatar: userData.avatar
      });
      const savedUser = await newUser.save();
      console.log("🚀 ~ UserService ~ registerUser ~ savedUser:", savedUser)
      // console.log('✅ User created successfully:', savedUser._id);

      const tokenPayload: JWTPayload = {
        userId: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name
      };

      const token = jwtUtils.generateToken(tokenPayload);

      await sessionUtils.setSession(savedUser._id.toString(), {
        email: savedUser.email,
        name: savedUser.name,
        loginTime: new Date()
      });

      return {
        success: true,
        message: "User registered successfully",
        user: {
          id: savedUser._id.toString(),
          email: savedUser.email,
          name: savedUser.name,
          avatar: savedUser.avatar
        },
        token
      };

    } catch (error) {
      return {
        success: false,
        message: "Registration failed. Please try again."
      };
    }
  }

  async loginUser(loginData: LoginUserInput): Promise<AuthResponse> {
    try {
      
      const user = await User.findOne({ email: loginData.email }).select('+password');
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      const isPasswordCorrect = await user.comparePassword(loginData.password);
      
      if (!isPasswordCorrect) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const tokenPayload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name
      };

      const token = jwtUtils.generateToken(tokenPayload);

      await sessionUtils.setSession(user._id.toString(), {
        email: user.email,
        name: user.name,
        loginTime: new Date()
      });

      // console.log('✅ User login successful:', user.email);

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar
        },
        token
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }
}