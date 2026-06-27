import jwt from 'jsonwebtoken';
import { ConflictError, NotFoundError, UnauthorizedError } from "../../common/errors/app-error";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import { AuthRepository } from "./auth.repository";
import type { AuthResultType, JwtPayloadType } from "./auth.types";
import { env } from '../../config/env';
import { sendPasswordResetEmail } from './auth.emailServices';
import type AuthIdParams from '../../common/parameters/authId.parameters';
import { buildConflictString } from '../users/users.utils';
import { randomBytes } from 'node:crypto';
import type { DeleteResult } from 'mongoose';
import type { UserRecord } from '../../common/mongo-db/schemas/user.schema';

export class AuthService {
   private readonly repository: AuthRepository;

   constructor(authRepository: AuthRepository) {
      this.repository = authRepository;
   }

   async changePassword(oldPassword: string, newPassword: string, { authId }: AuthIdParams): Promise<void> {
      if(!authId) { throw new UnauthorizedError(); }

      const userAndPassword = await this.repository.getUserWithPassword({_id: authId});
      if (!userAndPassword) { throw new UnauthorizedError(); }

      const validPassword = await verifyPassword(oldPassword, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError(); }

      const passwordHash = await hashPassword(newPassword);

      await this.repository.updatePassword(authId, passwordHash);
   }

   async login(name: string, password: string, rememberMe: boolean = false): Promise<AuthResultType> {
      const userAndPassword = await this.repository.getUserWithPassword({ name });
      if (!userAndPassword) { throw new UnauthorizedError('Invalid Username'); }

      const validPassword = await verifyPassword(password, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }

      // remove the passwordHash before returning to client
      const { passwordHash, ...user } = userAndPassword;

      return this.buildAuthResult(user);
   }

   async register(name: string, email: string, password: string): Promise<AuthResultType> {

      const conflictingUserList = await this.repository.getExactUserList({ name, email });

      if (conflictingUserList.length > 0) { 
         const conflictingUser = { _id: "0", name, email }
         throw new ConflictError(buildConflictString(conflictingUser, conflictingUserList)!);
      }
      
      const passwordHash = await hashPassword(password);
      const user = await this.repository.createUser(name, email, passwordHash);

      return this.buildAuthResult(user);
   }

   async removeRefreshToken(userId: string): Promise<DeleteResult> {
      return await this.repository.deleteRefreshTokensByUserId(userId);
   }

   async refreshTokens(refreshToken: string): Promise<AuthResultType> {

      let payload: JwtPayloadType;
      try { payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayloadType; }
      catch { throw new UnauthorizedError('invalid refresh token'); }

      const refreshTokenList = await this.repository.getRefreshTokenList(payload.authId);
      if (refreshTokenList.length == 0) { 
         throw new UnauthorizedError('invalid refresh token'); 
      }

      let matchingToken: boolean = false;
      for (const token of refreshTokenList) {
         const checkMatch = await verifyPassword(refreshToken, token.hash);
         if (checkMatch) { matchingToken = true; }
      }

      if (!matchingToken) { throw new UnauthorizedError('invalid refresh token'); }

      const userList = await this.repository.getExactUserList({ _id: payload.authId });
      if (!userList[0]) { throw new UnauthorizedError('invalid refresh token'); }

      return this.buildAuthResult(userList[0], { excludeRefreshToken: true });
   }

   async requestPasswordReset(email: string): Promise<void> {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await this.repository.getExactUserList({ email: normalizedEmail });
      if (!user[0]) { throw new UnauthorizedError(); }
      const userId = user[0]._id.toString()
      await this.repository.deletePasswordResetTokens(userId);

      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      await this.repository.createPasswordResetToken(userId, tokenHash);

      await sendPasswordResetEmail(email, resetToken);
   }

   async verifyPassword(_id: string, password: string): Promise<boolean> {
      const userWithPassword = await this.repository.getUserWithPassword({ _id });
      if (!userWithPassword) { throw new UnauthorizedError('Invalid _id provided'); }
      const validPassword = await verifyPassword(password, userWithPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }
      return true;
   }

   async resetPassword(password: string, resetToken: string): Promise<void> {
   
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      const tokenHashRecord = await this.repository.getPasswordResetToken(tokenHash);

      if (!tokenHashRecord) { throw new NotFoundError(""); }
      const userId = tokenHashRecord.tokenHash

      const [ hashedPassword ] = await Promise.all([
         hashPassword(password),
         this.repository.deletePasswordResetTokens(userId),
         this.repository.deleteRefreshTokensByUserId(userId),
      ]);

      await this.repository.updatePassword(userId, hashedPassword);
   }

   private async buildAuthResult(user: UserRecord, { excludeRefreshToken = false }: {excludeRefreshToken?: boolean } = {}): Promise<AuthResultType> {
      
      const accessToken = jwt.sign(
         { authId: user._id.toString() },
         env.JWT_ACCESS_SECRET,
         { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
      );

      if (excludeRefreshToken) {
         return {
            user,
            tokens: {
               accessToken,
               refreshToken: "",
            }
         }
      }

      const refreshToken = jwt.sign(
         { authId: user._id.toString() },
         env.JWT_REFRESH_SECRET,
         { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
      );

      const refreshTokenHash = await hashPassword(refreshToken);
      await this.repository.saveRefreshToken(user._id.toString(), refreshTokenHash);

      return {
         user,
         tokens: { accessToken, refreshToken }
      }
   }
}