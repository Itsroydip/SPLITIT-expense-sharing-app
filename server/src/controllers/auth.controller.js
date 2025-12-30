import db  from '../db.js'
import { users } from '../models/user.model.js'
import { eq } from 'drizzle-orm'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'


//<---------------------------------- Register new user----------------------------------->
export const register = async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required'
      })
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)


    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        fullName: fullName || null
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        createdAt: users.createdAt
      })

    // Generate token
    const token = generateToken(newUser.id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    })
  }
}


// <------------------------------------------- Login user ------------------------------------------->
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user.id)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    })
  }
}



//<------------------------------------ Get current user ----------------------------------->
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const userId = req.user.userId

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    })
  }
}