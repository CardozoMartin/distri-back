import { Router } from "express";
import { LoginController } from "../controller/login.controller";



const router = Router();
const loginC = new LoginController()

router.post('/',loginC.login)


export default router;