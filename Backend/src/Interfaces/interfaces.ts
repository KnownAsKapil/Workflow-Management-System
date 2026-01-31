type AccessTokenPayload = {
  userId: number
  role: "Developer" | "Manager"
}

type RefreshTokenPayload = {
  userId: number
}


export type {AccessTokenPayload, RefreshTokenPayload}