type AccessTokenPayload = {
  userId: number
  role: "Developer" | "Manager"
}

type RefreshTokenPayload = {
  userId: number
}

type TaskState = "ASSIGNED" | "ONGOING" | "REVIEW" | "ACCEPTED"



export type {AccessTokenPayload, RefreshTokenPayload, TaskState}