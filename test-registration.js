// Test script to verify registration API
const testRegistration = async () => {
  const testData = {
    firstName: "Test",
    lastName: "User",
    citizenshipNumber: "01-0001-00001",
    mobileNumber: "+9779812345678",
    email: "test@example.com",
    password: "password123",
    dateOfBirth: "1990-01-01",
    gender: "other",
    address: {
      province: "Bagmati",
      district: "Kathmandu",
      municipality: "KMC",
      ward: 1,
      streetAddress: "Test Address"
    }
  };

  try {
         const response = await fetch('http://localhost:9005/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Registration failed!');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
         console.log('Make sure the backend server is running on http://localhost:9005');
  }
};

// Test health endpoint first
const testHealth = async () => {
  try {
         const response = await fetch('http://localhost:9005/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is running!');
      console.log('Health check:', data);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend');
    console.log('Make sure to start the backend server first:');
    console.log('cd backend && npm run dev');
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing Ward Connect Nepal Registration...\n');
  
  const isHealthy = await testHealth();
  if (isHealthy) {
    console.log('\n📝 Testing registration...\n');
    await testRegistration();
  }
};

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
} else {
  // Browser environment
  window.testRegistration = testRegistration;
  window.testHealth = testHealth;
  console.log('Test functions available: testHealth() and testRegistration()');
}
