import { Router } from "express";
import { AuthController } from "../controller/authController";



const router = Router();
const authController = new AuthController(); // create instance

router.post('/register',authController.register)
router.post('/login',authController.login)

export default router;