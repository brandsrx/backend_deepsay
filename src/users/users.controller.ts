import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Req, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/profile.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-whit-user.interface';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService:UsersService){}

    @UseGuards(OptionalJwtAuthGuard)
    @Get(':username')
    @HttpCode(HttpStatus.ACCEPTED)
    async getProfileUser(
        @Param('username') username:string,
        @Req() req:RequestWithUser
    ):Promise<UserProfileDto>{
            const userId = req.user?.id;
            return await this.usersService.getUserProfile(username,userId);
    }

    @Patch(':id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: any
    ): Promise<UserResponseDto> {
        return this.usersService.updateUser(id, updateUserDto, req.user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteUser(
        @Param('id') id: string,
        @Request() req: any
    ): Promise<{ message: string }> {
        return this.usersService.deleteUser(id, req.user.id);
    }
}
