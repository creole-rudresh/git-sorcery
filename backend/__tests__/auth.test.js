// Must be set before any require so db.js uses :memory:
process.env.NODE_ENV = 'test'

const request = require('supertest')
const app = require('../app')
const { initDB, clearDB } = require('../db')

beforeAll(() => {
  initDB()
})

beforeEach(() => {
  clearDB()
})

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('returns 201 with token and username on success', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      username: 'alice',
      password: 'secret123',
    })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.username).toBe('alice')
  })

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  test('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'bob@example.com',
      username: 'bob',
      password: '123',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/6 characters/)
  })

  test('returns 400 for invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      username: 'carol',
      password: 'password123',
    })
    expect(res.status).toBe(400)
  })

  test('returns 409 when email is already registered', async () => {
    const payload = { email: 'dup@example.com', username: 'dup', password: 'password123' }
    await request(app).post('/api/auth/register').send(payload)
    const res = await request(app).post('/api/auth/register').send(payload)
    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already registered/i)
  })
})

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const USER = { email: 'dave@example.com', username: 'dave', password: 'mypassword' }

  beforeEach(async () => {
    // Register the test user fresh before each login test
    await request(app).post('/api/auth/register').send(USER)
  })

  test('returns 200 with token when credentials are correct', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: USER.email,
      password: USER.password,
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.username).toBe(USER.username)
  })

  test('returned token carries the correct username claim', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: USER.email,
      password: USER.password,
    })
    // JWT payload is the middle base64 segment
    const payload = JSON.parse(
      Buffer.from(res.body.token.split('.')[1], 'base64').toString()
    )
    expect(payload.username).toBe(USER.username)
  })

  test('returns 401 when password is wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: USER.email,
      password: 'completely-wrong-password',
    })
    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  test('returns 401 when email does not exist', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: USER.password,
    })
    expect(res.status).toBe(401)
  })

  test('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: USER.email,
    })
    expect(res.status).toBe(400)
  })
})
