// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserMaster = require('../dal/models/UserMasterModel'); // Adjust the path as needed
// const bcrypt = require('bcrypt');
// const saltRounds = 10; // Number of salt rounds for hashing
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

router.post('/registerUser', async (req, res) => {
  console.log('in /registerUser');
  try {
    // Extract user data from the request body
    const userData = req.body;
    // console.log("userData:",userData);
      // Hash the password
      const hashedPassword = CryptoJS.SHA256(userData.password).toString();
    // Insert the new user data into the database
    const newUser = await UserMaster.create({
      name: userData.name,
      email_id: userData.email,
      password: hashedPassword,
      mobile_no: userData.Mobile_No,
      register_date: new Date(), // Set the current date for registration
      is_locked: userData.is_locked || false, // Default to false if not provided
      remark: userData.remark || '',
      gender: userData.Gender || '',
      pincode: userData.pincode || '',
      area: userData.area || '',
      city: userData.city || '',
      state: userData.state || '',
    });

    // Respond with a success message containing the registered user data
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Failed to register user' });
  }
});

// router.post('/login', async (req, res) => {
//   console.log('in /login');
//   try {
//     // Extract login data from the request body
//     const { email, password  } = req.body;

//     // Find the user by email
//     const user = await UserMaster.findOne({ where: { email_id: email } });
//     // console.log("user find by findOne:",user);
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not found' });
//     }

//     // Compare provided password with the stored hashed password
//     const match = await bcrypt.compare(password, user.password);
//     if (match) {
//       // Passwords match
//       const token = jwt.sign({ user: user}, process.env.JWT_SECRET, { expiresIn: '3h' }); // Adjust expiry as needed
//       console.log("in login jwt token:",token);
//       res.json({ success: true, token: token });
//       // console.log("{ success: true, token: token }",{ success: true, token: token });
//     } else {
//       // Passwords do not match
//       res.status(401).json({ success: false, message: 'Invalid password' });
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     res.status(500).json({ success: false, message: 'Failed to login' });
//   }
// });

router.post('/login', async (req, res) => {
  console.log('in /login');
  try {
    const { email, password } = req.body;

    const user = await UserMaster.findOne({ where: { email_id: email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const storedHashedPassword = user.password;
    // const hashedPassword = CryptoJS.SHA256(password).toString();
    const combinedString = `${email}${storedHashedPassword}!@#`;
    const finalHash = CryptoJS.SHA256(combinedString).toString();

    const authorizationHeader = req.headers.authorization;
    const providedHash = authorizationHeader && authorizationHeader.split(' ')[1];
    console.log("providedHash:",providedHash);
    console.log("finalHash:",finalHash);
    if (providedHash && providedHash === finalHash) {
      const token = jwt.sign({ user: user }, process.env.JWT_SECRET, { expiresIn: '2h' });
      console.log("in login jwt token:", token);
      res.json({ success: true, token: token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
});



module.exports = router;
