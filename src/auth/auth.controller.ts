import { Controller,Get,Post, UseGuards,Req,Res, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {SignupDto} from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
    constructor(
        private authService:AuthService
    ){};

    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        return {msg: 'Redirecting to Google'};
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleRedirect(@Req() req){
        const user = await req.user;
        const token = await this.authService.validateOAuthSignup(user);
        return {
            message:'User created',
            access_token:token
        };
    }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signup_user:SignupDto){
        const token = await this.authService.createUser(signup_user);
        return {
            message:'User created',
            access_token:token
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.CREATED)
    async login(@Body() loginDto:LoginDto){
        const token = await this.authService.login(loginDto);
        return {
            message:'Login Successfly',
            access_token:token
        };
    }

    
}
