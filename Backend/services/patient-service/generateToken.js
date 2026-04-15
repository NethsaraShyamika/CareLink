// generateToken.js
import jwt from 'jsonwebtoken';

// HARDCODE the secret to ensure it matches
const JWT_SECRET = 'mysecretkey123';

const payload = { 
    userId: "patient123",
    role: "patient",
    email: "patient@test.com",
    firstName: "John",
    lastName: "Doe"
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

console.log('\n=================================');
console.log('JWT_SECRET used:', JWT_SECRET);
console.log('=================================');
console.log('\n✅ COPY THIS TOKEN:\n');
console.log(token);
console.log('\n=================================');
console.log('Use this in Postman as Bearer Token');
console.log('URL: http://localhost:5002/api/patients/profile');
console.log('=================================\n');

// Verify the token immediately to confirm it works
try {
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully with payload:', verified);
} catch (err) {
    console.error('❌ Token verification failed:', err.message);
}