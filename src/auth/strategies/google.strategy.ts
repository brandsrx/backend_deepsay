import { Injectable ,InternalServerErrorException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy,VerifyCallback} from "passport-google-oauth20";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const uriRedirect = configService.get<string>('GOOGLE_REDIRECT_URI');
    if (!clientID || !clientSecret ) {
      throw new InternalServerErrorException('Google OAuth credentials not configured.');
    }
    super({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: uriRedirect,
        scope: ['email','profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: name.givenName+' '+name.familyName,
      picture: photos[0].value,
      provider: 'google',
    };

    done(null, user);
  }
}