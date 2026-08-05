import type { DeleteResult } from "mongoose";
import { RefreshTokenModel, type RefreshTokenRecord } from "../../common/mongo-db/schemas/refreshToken.schema";
import { UserModel, type UserRecord } from "../../common/mongo-db/schemas/user.schema";
import { PasswordResetTokenModel, type PasswordResetTokenRecord } from "../../common/mongo-db/schemas/passwordResetToken.schema";

type UserWithPassword = UserRecord & { passwordHash: string; };

type GetUserWithPasswordParams =
   | { _id: string, name?: string }
   | { _id?: string, name: string }

export class AuthRepository {

   async createPasswordResetToken(userId: string, tokenHash: string): Promise<void> {
      await PasswordResetTokenModel.create({ userId, tokenHash });
   }

   async createUser (name: string, email: string, passwordHash: string): Promise<UserRecord> {
      const user = await UserModel.create({ name, email, passwordHash });
      const { passwordHash: _ , __v, ...record } = user.toObject();
      return record;
   }

   async deletePasswordResetTokens(userId: string): Promise<DeleteResult> {
      return await PasswordResetTokenModel.deleteMany({ userId });
   }

   async deleteRefreshTokenByHash(hash: string): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteOne({ hash })
   }

   async deleteRefreshTokensByUserId(userId: string): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteMany({ userId });
   }

   async getExactUserList({_id, name, email}: { _id?: string, name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (_id) conditions.push({ _id });
      if (name) conditions.push({ name });
      if (email) conditions.push({ email });

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).lean();
      return userList;
   }

   async getPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
      const passwordResetToken = await PasswordResetTokenModel.findOne({ tokenHash });
      return passwordResetToken;
   }

   //! VALUES FROM THIS REPOSITORY CONTAINS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async getUserWithPassword({ _id, name }: GetUserWithPasswordParams): Promise<UserWithPassword | null> {
      return UserModel.findOne({ ...(_id && { _id }), ...(name && { name }) }).select('+passwordHash').lean<UserWithPassword>();
   }

   async getRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
      return RefreshTokenModel.findOne({ hash: tokenHash }).lean<RefreshTokenRecord>();
   }

   async saveRefreshToken(userId: string, hash: string): Promise<void> {
      await RefreshTokenModel.create({ userId, hash });
   }

   async updatePassword(userId: string, passwordHash: string): Promise<void> {
      await UserModel.findByIdAndUpdate(userId, { $set: { passwordHash } });
   }
}