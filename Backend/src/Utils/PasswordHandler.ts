import bcrypt from "bcrypt"
const hashRounds = 10
async function hashPassword(password: string): Promise<string>{
    const newPassword = await bcrypt.hash(password, hashRounds)
    return newPassword
}

async function checkPassword(password: string, dbPassword: string): Promise<boolean>{
    const isMatch = await bcrypt.compare(password, dbPassword)

    return isMatch

}

export {hashPassword, checkPassword}