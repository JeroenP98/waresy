import request from 'supertest';
import app from '../../../server/index.js';
import mongoose from 'mongoose';
import {UserSchema} from "../../../server/models/userModel.js";

let authToken;
let User;

beforeAll(async () => {
    User = mongoose.model('User', UserSchema);

    const testUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Test@1234",
        role: "Admin"
    };

    // Register test user
    await request(app)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

    // Login to get JWT token
    const loginResponse = await request(app)
        .post('/auth/login')
        .send({
            email: testUser.email,
            password: testUser.password
        })
        .expect(200);

    authToken = loginResponse.body.token;
});

afterAll(async () => {
    try {
        await User.deleteMany({});
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    } catch (err) {
        console.error('Error during afterAll cleanup:', err);
    }
});

describe('User Controller', () => {
    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    password: 'StrongPass123!',
                    role: 'User'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/successfully registered/i);
            expect(response.body.data).toHaveProperty('email', 'jane.smith@example.com');
            expect(response.body.data).not.toHaveProperty('hashPassword'); // ensure password is not exposed
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'MissingFields'
                    // lastName, email, password are missing
                })
                .expect(400);

            expect(response.body.message || response.body.error).toMatch(/required/i);
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'BadEmail',
                    lastName: 'Tester',
                    email: 'not-an-email',
                    password: 'ValidPassword123!',
                    role: 'User'
                })
                .expect(400);

            expect(response.body.message || response.body.error).toMatch(/valid email/i);
        });

        it('should return 400 for duplicate email registration', async () => {
            const duplicateUser = {
                firstName: 'Duplicate',
                lastName: 'User',
                email: 'john.doe@example.com', // already registered in beforeAll
                password: 'AnotherPass123!',
                role: 'User'
            };

            const response = await request(app)
                .post('/auth/register')
                .send(duplicateUser)
                .expect(400);

            expect(response.body.message || response.body.error).toMatch(/duplicate/i);
        });
    });
    describe('POST /auth/login', () => {
        it('should log in successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: 'Test@1234'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toMatch(/logged in/i);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return 400 if email or password is missing', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({ email: 'john.doe@example.com' }) // password is missing
                .expect(400);

            expect(response.body.message || response.body.error).toMatch(/required/i);
        });

        it('should return 401 if password is incorrect', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: 'WrongPassword!'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/invalid password/i);
        });

        it('should return 404 if user is not found', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'DoesNotMatter123'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });
    });
    describe('GET /auth/user?email=', () => {
        const testUser = {
            firstName: 'Alice',
            lastName: 'Wonder',
            email: 'alice@example.com',
            password: 'Password123!',
            role: 'User'
        };

        const otherUser = {
            firstName: 'Bob',
            lastName: 'Builder',
            email: 'bob@example.com',
            password: 'BuilderPass456!',
            role: 'User'
        };

        let userToken;
        let otherToken;

        beforeAll(async () => {
            // Register both users
            await request(app).post('/auth/register').send(testUser).expect(201);
            await request(app).post('/auth/register').send(otherUser).expect(201);

            // Login Alice
            const loginRes = await request(app).post('/auth/login').send({
                email: testUser.email,
                password: testUser.password
            });
            userToken = loginRes.body.data.token;

            // Login Bob
            const otherLoginRes = await request(app).post('/auth/login').send({
                email: otherUser.email,
                password: otherUser.password
            });
            otherToken = otherLoginRes.body.data.token;
        });

        afterAll(async () => {
            const User = mongoose.model('User', UserSchema);
            await User.deleteMany({});
        });

        it('should return the current user\'s profile if token and email match', async () => {
            const response = await request(app)
                .get(`/auth/user?email=${testUser.email}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });

        it('should return 403 if user tries to access another user\'s profile', async () => {
            const response = await request(app)
                .get(`/auth/user?email=${otherUser.email}`)
                .set('Authorization', `Bearer ${userToken}`) // Alice using Bob's email
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/access denied/i);
        });

        it('should return 400 if no email is provided', async () => {
            const response = await request(app)
                .get('/auth/user')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/email is required/i);
        });

        it('should return 404 if the user does not exist', async () => {
            const fakeEmail = 'doesnotexist@example.com';
            const response = await request(app)
                .get(`/auth/user?email=${fakeEmail}`)
                .set('Authorization', `Bearer ${userToken}`) // token is valid, but email not found
                .expect(403); // Still 403 due to mismatch, not 404

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/access denied/i);
        });
        it('should return 404 if user does not exist but token matches', async () => {
            const fakeEmail = 'ghost@example.com';

            // Create token for ghost email manually
            const jwt = await import('jsonwebtoken');
            const token = jwt.default.sign(
                { email: fakeEmail, _id: 'nonexistent-id', role: 'User' },
                process.env.JWT_SECRET
            );

            const response = await request(app)
                .get(`/auth/user?email=${fakeEmail}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });
        it('should handle database errors gracefully', async () => {
            const jwt = await import('jsonwebtoken');
            const token = jwt.default.sign(
                { email: 'errorcase@example.com', _id: 'mockid', role: 'User' },
                process.env.JWT_SECRET
            );

            // Temporarily override User.findOne to throw an error
            const User = mongoose.model('User', UserSchema);
            const originalFindOne = User.findOne;
            User.findOne = () => { throw new Error('Simulated DB failure'); };

            const response = await request(app)
                .get('/auth/user?email=errorcase@example.com')
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve user/i);

            // Restore original method
            User.findOne = originalFindOne;
        });


    });
    describe('PATCH /auth/user/:email', () => {
        const alice = {
            firstName: 'Alice',
            lastName: 'Wonder',
            email: 'alice.update@example.com',
            password: 'Update123!',
            role: 'User'
        };

        const bob = {
            firstName: 'Bob',
            lastName: 'Admin',
            email: 'bob.admin@example.com',
            password: 'Admin456!',
            role: 'Admin'
        };

        let aliceToken;
        let bobToken;

        beforeAll(async () => {
            await request(app).post('/auth/register').send(alice).expect(201);
            await request(app).post('/auth/register').send(bob).expect(201);

            const aliceLogin = await request(app).post('/auth/login').send({
                email: alice.email,
                password: alice.password
            });
            aliceToken = aliceLogin.body.data.token;

            const bobLogin = await request(app).post('/auth/login').send({
                email: bob.email,
                password: bob.password
            });
            bobToken = bobLogin.body.data.token;
        });

        afterAll(async () => {
            const User = mongoose.model('User', UserSchema);
            await User.deleteMany({});
        });

        it('should allow a user to update their own profile', async () => {
            const response = await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ firstName: 'Alicia' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Alicia');
        });

        it('should allow an admin to update another user\'s profile', async () => {
            const response = await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${bobToken}`)
                .send({ lastName: 'UpdatedByAdmin' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.lastName).toBe('UpdatedByAdmin');
        });

        it('should reject a user trying to update another user\'s profile', async () => {
            const response = await request(app)
                .patch(`/auth/user/${bob.email}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ firstName: 'HackerAlice' })
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/access denied/i);
        });

        it('should prevent non-admin users from changing their own role', async () => {
            const response = await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ role: 'Admin' }) // malicious intent
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not allowed to change your role/i);

            // Confirm role is still 'User'
            const User = mongoose.model('User', UserSchema);
            const updatedUser = await User.findOne({ email: alice.email });
            expect(updatedUser.role).toBe('User');
        });

        it('should allow an admin to change a user\'s role', async () => {
            const response = await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${bobToken}`)
                .send({ role: 'Admin' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.role).toBe('Admin');
        });

        it('should hash the password if provided during update', async () => {
            const newPassword = 'NewSecurePass123!';

            await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ password: newPassword })
                .expect(200);

            // Fetch updated user from DB
            const User = mongoose.model('User', UserSchema);
            const updatedUser = await User.findOne({ email: alice.email });

            expect(updatedUser).toBeDefined();
            expect(updatedUser.hashPassword).toBeDefined();

            const passwordMatches = await updatedUser.comparePassword(newPassword, updatedUser.hashPassword);
            expect(passwordMatches).toBe(true);
        });

        it('should return 404 if user to update does not exist', async () => {
            const nonExistentEmail = 'ghostuser@example.com';

            const response = await request(app)
                .patch(`/auth/user/${nonExistentEmail}`)
                .set('Authorization', `Bearer ${bobToken}`) // Admin
                .send({ firstName: 'Ghosty' })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should handle database errors gracefully during update', async () => {
            const User = mongoose.model('User', UserSchema);
            const originalUpdate = User.findOneAndUpdate;

            // Force error
            User.findOneAndUpdate = () => { throw new Error('Simulated DB failure'); };

            const response = await request(app)
                .patch(`/auth/user/${alice.email}`)
                .set('Authorization', `Bearer ${aliceToken}`)
                .send({ firstName: 'CrashTest' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to update user/i);

            // Restore original
            User.findOneAndUpdate = originalUpdate;
        });


    });
    describe('GET /auth/users', () => {
        const adminUser = {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: 'Admin'
        };

        const normalUser = {
            firstName: 'Regular',
            lastName: 'User',
            email: 'user@example.com',
            password: 'User123!',
            role: 'User'
        };

        let adminToken;
        let userToken;

        beforeAll(async () => {
            // Register both users
            await request(app).post('/auth/register').send(adminUser).expect(201);
            await request(app).post('/auth/register').send(normalUser).expect(201);

            // Log in admin
            const adminLogin = await request(app)
                .post('/auth/login')
                .send({ email: adminUser.email, password: adminUser.password });
            adminToken = adminLogin.body.data.token;

            // Log in regular user
            const userLogin = await request(app)
                .post('/auth/login')
                .send({ email: normalUser.email, password: normalUser.password });
            userToken = userLogin.body.data.token;
        });

        afterAll(async () => {
            const User = mongoose.model('User', UserSchema);
            await User.deleteMany({});
        });

        it('should allow an admin to retrieve all users', async () => {
            const response = await request(app)
                .get('/auth/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
            response.body.data.forEach(user => {
                expect(user).not.toHaveProperty('hashPassword');
            });
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app)
                .get('/auth/users')
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Unauthorized');
        });
        it('should handle database errors gracefully when retrieving all users', async () => {
            const User = mongoose.model('User', UserSchema);

            // Temporarily mock User.find to throw
            const originalFind = User.find;
            User.find = () => {
                throw new Error('Simulated DB error');
            };

            const response = await request(app)
                .get('/auth/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/failed to retrieve users/i);

            // Restore the original function
            User.find = originalFind;
        });

    });
    describe('DELETE /auth/user/:email', () => {
        const admin = {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin.delete@example.com',
            password: 'Admin123!',
            role: 'Admin'
        };

        const userToDelete = {
            firstName: 'DeleteMe',
            lastName: 'Target',
            email: 'target@example.com',
            password: 'Target456!',
            role: 'User'
        };

        const otherUser = {
            firstName: 'Regular',
            lastName: 'User',
            email: 'regular@example.com',
            password: 'User789!',
            role: 'User'
        };

        let adminToken;
        let userToken;

        beforeAll(async () => {
            // Register accounts
            await request(app).post('/auth/register').send(admin).expect(201);
            await request(app).post('/auth/register').send(userToDelete).expect(201);
            await request(app).post('/auth/register').send(otherUser).expect(201);

            // Log in admin
            const adminLogin = await request(app).post('/auth/login').send({
                email: admin.email,
                password: admin.password
            });
            adminToken = adminLogin.body.data.token;

            // Log in regular user
            const userLogin = await request(app).post('/auth/login').send({
                email: otherUser.email,
                password: otherUser.password
            });
            userToken = userLogin.body.data.token;
        });

        afterAll(async () => {
            const User = mongoose.model('User', UserSchema);
            await User.deleteMany({});
        });

        it('should allow an admin to delete a user', async () => {
            const res = await request(app)
                .delete(`/auth/user/${userToDelete.email}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/deleted/i);
            expect(res.body.data.email).toBe(userToDelete.email);
        });

        it('should return 404 if user to delete does not exist', async () => {
            const res = await request(app)
                .delete('/auth/user/nonexistent@example.com')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });

        it('should reject non-admin users trying to delete users', async () => {
            const res = await request(app)
                .delete(`/auth/user/${admin.email}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/access denied/i);
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app)
                .delete(`/auth/user/${admin.email}`)
                .expect(401);

            expect(res.body).toHaveProperty('message', 'Unauthorized');
        });

        it('should handle database errors gracefully', async () => {
            const User = mongoose.model('User', UserSchema);
            const originalDelete = User.findOneAndDelete;
            User.findOneAndDelete = () => {
                throw new Error('Simulated DB error');
            };

            const res = await request(app)
                .delete(`/auth/user/${otherUser.email}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/failed to delete/i);

            User.findOneAndDelete = originalDelete;
        });
    });



});