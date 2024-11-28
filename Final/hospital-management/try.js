const bcrypt = require('bcrypt');

const testPasswordHashing = async () => {
  const plainPassword = '1234';

  // Hash the plain password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log('Hashed Password:', hashedPassword);

  // Compare the plain password with a pre-stored hashed password
  const storedHashedPassword = '$2b$10$7/vMk7SMTqy1/5C36LkiLOJKFKmNcaNU0xrQtVeAxhNHKKqgTHqH2';

  const isMatch = await bcrypt.compare(plainPassword, storedHashedPassword);
  console.log(isMatch ? 'Password matches' : 'Password does not match');
};

// Run the test function
testPasswordHashing();
