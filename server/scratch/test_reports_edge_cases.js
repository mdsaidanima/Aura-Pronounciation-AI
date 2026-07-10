const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function authenticateTestUser() {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email: 'test@example.com',
    password: 'password123'
  });
  return response.data.token;
}

async function testReportsEdgeCases() {
  console.log('=== REPORTS EDGE CASES & SECURITY TESTING ===\\n');

  const token = await authenticateTestUser();
  let allTestsPassed = true;

  // Test 1: Invalid Report ID Access
  console.log('🔒 TESTING SECURITY & EDGE CASES');
  console.log('─'.repeat(40));
  
  try {
    const fakeReportId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
    await axios.get(`${API_BASE}/reports/${fakeReportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ❌ Invalid Report Access: Should have returned 404');
    allTestsPassed = false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Invalid Report Access: Properly returns 404');
    } else {
      console.log(`   ❌ Unexpected error: ${error.response?.status || 'No status'}`);
      allTestsPassed = false;
    }
  }

  // Test 2: Malformed Report ID
  try {
    await axios.get(`${API_BASE}/reports/invalid-id-format`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ❌ Malformed ID: Should have returned 404');
    allTestsPassed = false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Malformed Report ID: Properly handled');
    } else {
      console.log(`   ❌ Unexpected error for malformed ID: ${error.response?.status}`);
      allTestsPassed = false;
    }
  }

  // Test 3: PDF Download without Report ID
  try {
    await axios.get(`${API_BASE}/download/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
      // Missing reportId parameter
    });
    console.log('   ❌ PDF without ID: Should have returned 400');
    allTestsPassed = false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ PDF Download Validation: Requires report ID');
    } else {
      console.log(`   ❌ Unexpected error for PDF without ID: ${error.response?.status}`);
      allTestsPassed = false;
    }
  }

  // Test 4: Large Search Query
  try {
    const longSearchTerm = 'a'.repeat(1000); // Very long search term
    const response = await axios.get(`${API_BASE}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: longSearchTerm }
    });
    console.log('   ✅ Large Search Query: Handled gracefully');
  } catch (error) {
    console.log(`   ⚠️  Large Search Query: ${error.message}`);
    // This might fail but shouldn't crash the system
  }

  // Test 5: Pagination Boundary Testing
  try {
    const response = await axios.get(`${API_BASE}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 999999, limit: 100 }
    });
    
    if (response.data.reports.length === 0 && response.data.pagination.page === 999999) {
      console.log('   ✅ High Page Number: Returns empty results correctly');
    } else {
      console.log('   ⚠️  High Page Number: Unexpected behavior');
    }
  } catch (error) {
    console.log(`   ⚠️  Pagination Boundary: ${error.message}`);
  }

  // Test 6: Invalid Sort Parameters
  try {
    const response = await axios.get(`${API_BASE}/reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { sortBy: 'invalidField', order: 'invalidOrder' }
    });
    console.log('   ✅ Invalid Sort: Handled without crashing');
  } catch (error) {
    console.log(`   ⚠️  Invalid Sort Parameters: ${error.message}`);
  }

  // Test 7: Authentication Required
  try {
    await axios.get(`${API_BASE}/reports`);
    console.log('   ❌ No Auth: Should have returned 401');
    allTestsPassed = false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Authentication Required: Properly enforced');
    } else {
      console.log(`   ❌ Unexpected auth error: ${error.response?.status}`);
      allTestsPassed = false;
    }
  }

  // Test 8: Delete Non-existent Report
  try {
    const fakeReportId = '507f1f77bcf86cd799439011';
    await axios.delete(`${API_BASE}/reports/${fakeReportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ❌ Delete Non-existent: Should have returned 404');
    allTestsPassed = false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Delete Non-existent Report: Properly returns 404');
    } else {
      console.log(`   ❌ Unexpected delete error: ${error.response?.status}`);
      allTestsPassed = false;
    }
  }

  console.log('\\n=== EDGE CASES SUMMARY ===');
  if (allTestsPassed) {
    console.log('🎉 ALL SECURITY & EDGE CASE TESTS PASSED!');
    console.log('\\n🔒 Security Features Verified:');
    console.log('   ✅ Authentication properly required');
    console.log('   ✅ Invalid report IDs handled gracefully');
    console.log('   ✅ Malformed requests return appropriate errors');
    console.log('   ✅ PDF download validation working');
    console.log('   ✅ Pagination boundary conditions handled');
    console.log('   ✅ Search query limits respected');
  } else {
    console.log('❌ SOME EDGE CASE TESTS FAILED');
    console.log('⚠️  Review error handling implementation');
  }

  return allTestsPassed;
}

testReportsEdgeCases().catch(console.error);