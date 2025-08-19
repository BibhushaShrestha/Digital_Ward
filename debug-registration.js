// Comprehensive debugging script for registration issues
console.log('🔍 Starting Registration Debug...\n');

// Test 1: Check if backend is running
const testBackendHealth = async () => {
  console.log('1️⃣ Testing backend health...');
  try {
    const response = await fetch('http://localhost:9005/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is running!');
      console.log('   Status:', data.status);
      console.log('   Environment:', data.environment);
      console.log('   Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend');
    console.log('   Error:', error.message);
    console.log('   Make sure to start the backend server: cd backend && npm run dev');
    return false;
  }
};

// Test 2: Check CORS
const testCORS = async () => {
  console.log('\n2️⃣ Testing CORS...');
  try {
    const response = await fetch('http://localhost:9005/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ CORS preflight successful');
    console.log('   Status:', response.status);
    return true;
  } catch (error) {
    console.log('❌ CORS test failed');
    console.log('   Error:', error.message);
    return false;
  }
};

// Test 3: Test registration with minimal data
const testMinimalRegistration = async () => {
  console.log('\n3️⃣ Testing minimal registration...');
  
  const minimalData = {
    firstName: "Test",
    lastName: "User",
    citizenshipNumber: "01-0001-00001",
    mobileNumber: "+9779812345678",
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
      body: JSON.stringify(minimalData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Minimal registration successful!');
      console.log('   User ID:', data.data?.user?.id);
      console.log('   Token received:', !!data.data?.token);
      return true;
    } else {
      console.log('❌ Minimal registration failed!');
      console.log('   Status:', response.status);
      console.log('   Error:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during registration');
    console.log('   Error:', error.message);
    return false;
  }
};

// Test 4: Test registration with email
const testRegistrationWithEmail = async () => {
  console.log('\n4️⃣ Testing registration with email...');
  
  const dataWithEmail = {
    firstName: "Test",
    lastName: "User",
    citizenshipNumber: "01-0002-00002",
    mobileNumber: "+9779812345679",
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
      body: JSON.stringify(dataWithEmail)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration with email successful!');
      console.log('   User ID:', data.data?.user?.id);
      console.log('   Email verified:', data.data?.user?.isEmailVerified);
      return true;
    } else {
      console.log('❌ Registration with email failed!');
      console.log('   Status:', response.status);
      console.log('   Error:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during email registration');
    console.log('   Error:', error.message);
    return false;
  }
};

// Test 5: Test duplicate registration
const testDuplicateRegistration = async () => {
  console.log('\n5️⃣ Testing duplicate registration...');
  
  const duplicateData = {
    firstName: "Test",
    lastName: "User",
    citizenshipNumber: "01-0001-00001", // Same as test 3
    mobileNumber: "+9779812345678",
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
      body: JSON.stringify(duplicateData)
    });

    const data = await response.json();
    
    if (response.status === 400 && data.message?.includes('already exists')) {
      console.log('✅ Duplicate registration properly rejected!');
      console.log('   Expected error:', data.message);
      return true;
    } else {
      console.log('❌ Duplicate registration not properly handled!');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during duplicate test');
    console.log('   Error:', error.message);
    return false;
  }
};

// Test 6: Test invalid data
const testInvalidData = async () => {
  console.log('\n6️⃣ Testing invalid data validation...');
  
  const invalidData = {
    firstName: "T", // Too short
    lastName: "U", // Too short
    citizenshipNumber: "invalid", // Wrong format
    mobileNumber: "123", // Invalid mobile
    password: "123", // Too short
    dateOfBirth: "invalid-date",
    gender: "invalid",
    address: {
      province: "",
      district: "",
      municipality: "",
      ward: 0, // Invalid ward
      streetAddress: ""
    }
  };

  try {
    const response = await fetch('http://localhost:9005/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    const data = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Invalid data properly rejected!');
      console.log('   Error:', data.message);
      return true;
    } else {
      console.log('❌ Invalid data not properly validated!');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error during validation test');
    console.log('   Error:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🧪 Starting comprehensive registration tests...\n');
  
  const results = {
    backend: await testBackendHealth(),
    cors: await testCORS(),
    minimal: await testMinimalRegistration(),
    withEmail: await testRegistrationWithEmail(),
    duplicate: await testDuplicateRegistration(),
    validation: await testInvalidData()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Registration should be working.');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
  }
};

// Run tests if in browser
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.testBackendHealth = testBackendHealth;
  window.testCORS = testCORS;
  window.testMinimalRegistration = testMinimalRegistration;
  console.log('Debug functions available: runAllTests(), testBackendHealth(), etc.');
} else {
  // Run in Node.js environment
  runAllTests();
}
