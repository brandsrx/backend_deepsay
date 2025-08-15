import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { FollowsModule } from './follows/follows.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TagsModule } from './tags/tags.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommunityModule } from './community/community.module';
@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    UsersModule,
    AuthModule, 
    PostsModule, 
    CommentsModule, 
    ReactionsModule, 
    FollowsModule, 
    NotificationsModule, 
    SearchModule, 
    AnalyticsModule, 
    TagsModule, 
    AdminModule, 
    PrismaModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
