import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from "bcrypt";
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { users } from 'generated/prisma';
@Injectable()
export class AuthService {
    constructor(
        private prisma:PrismaService,
        private jwtService:JwtService,
    ){}
    async generateJWT(id:string,username:string,role:string){
        return this.jwtService.sign({
            id,
            username,
            role
        })
    }
    async createUser(userDto:SignupDto):Promise<any>{
        const { password, ...rest } = userDto;
        const hashedPassword = await bcrypt.hash(password,10);
       
       try{
            const newUser = await this.prisma.users.create({
                data:{
                    ...rest,
                    password_hash : hashedPassword,
                }
            }) 
            return await this.generateJWT(newUser.id,newUser.username,newUser.role??'user');       
       }catch(error){
            if(error.code === 'P2002'){
                throw new ConflictException("User already exists");
            }
            throw new InternalServerErrorException('err to create user');
       }
    }
    async validateOAuthLogin(user: any): Promise<any> {

    }

    async validateOAuthSignup(profile: any): Promise<string> {
        const email = profile.email;
        const name = profile.name;
        const avatar_url = profile.picture;

        if (!email || !name) {
            throw new InternalServerErrorException('Invalid OAuth profile data');
        }

        const existingUser = await this.prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            return this.generateJWT(existingUser.id, existingUser.username, existingUser.role ?? 'user');
        }

        const userDto: SignupDto = {
            email,
            name,
            avatar_url,
            username: this.generateUsername(email),
            password: "null", 
        };

        return this.createUser(userDto);
    }
    isEmail(email: string): boolean {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return emailRegex.test(email);
    }
    async login(loginDto:LoginDto):Promise<string>{
        let user:any|null;
        if(this.isEmail(loginDto.email_or_username)){
            const email = loginDto.email_or_username;
            user =  await this.prisma.users.findUnique({ where: { email} });
        }
        const username = loginDto.email_or_username;
        user = await this.prisma.users.findUnique({where:{username}});
        if(!user){
            throw new BadRequestException("User not exist's");
        }
        const valid = await bcrypt.compare(loginDto.password,user.password_hash);
        if(!valid){
            throw new BadRequestException("Password is incorrect");
        }
        return this.generateJWT(user.id,username,user.role);
    }

    generateUsername(email: string): string {
        return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Date.now();
    }
}
