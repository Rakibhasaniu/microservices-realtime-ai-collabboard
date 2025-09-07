import { UserService } from "../services/userServices";
import { Request, Response } from 'express';


interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  private userService = new UserService();

  constructor() {
    this.userService = new UserService();

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);

  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, avatar }: RegisterRequest = req.body;
      if (!email || !password || !name) {
        console.log('❌ Missing required fields');
        res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password, name'
        });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format');
        res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
        return;
      }
      if (password.length < 6) {
        console.log('❌ Password too short');
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
        return;
      }
      console.log("controller",email,password,name,avatar)
      const result = await this.userService.registerUser({
        email: email.toLocaleLowerCase().trim(),
        password,
        name: name.trim(),
        avatar
      })
      console.log("🚀 ~ AuthController ~ register ~ result:", result)
      if (result.success) {
        console.log('✅ Registration successful, sending 201 response');
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            token: result.token
          }
        });
      } else {
        console.log('❌ Registration failed:', result.message);
        res.status(409).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error('💥 Controller: Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again.'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;
      if (!email || !password) {
        console.log('❌ Missing login credentials');
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }
      const result = await this.userService.loginUser({
        email: email.toLowerCase().trim(),
        password
      })
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            user: result.user,
            token: result.token
          }
        })
      }
    } catch (error) {
      console.error('💥 Controller: Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again.'
      });
    }
  }
}