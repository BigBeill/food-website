import type { UserRecord } from "../../common/mongo-db/schemas/user.schema";

export interface AuthTokensType {
   accessToken: string;
   refreshToken: string;
}

export interface AuthResultType {
   user: UserRecord
   tokens: AuthTokens;
}

export interface JwtPayloadType {
   authId: string;
   issued?: number;
   expires?: number;
}