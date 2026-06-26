import type { UserRecord } from "../../common/mongo-db/schemas/user.schema";

export interface AuthTokens {
   accessToken: string;
   refreshToken: string;
}

export interface AuthResult {
   user: UserRecord
   tokens: AuthTokens;
}

export interface JwtPayload {
   authId: string;
   issued?: number;
   expires?: number;
}