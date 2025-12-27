import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

// Compare password with hash
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}