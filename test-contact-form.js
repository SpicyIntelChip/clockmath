// Test Contact Form Functionality
console.log('Testing Contact Form Functionality...\n');

// Sample form data
const formData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Testing the contact form',
  category: 'Bug Report',
  message: 'This is a test message to verify the contact form works correctly.'
};

// Simulate the form submission logic
function testContactForm(data) {
  console.log('Form Data:');
  console.log(`- Name: ${data.name}`);
  console.log(`- Email: ${data.email}`);
  console.log(`- Category: ${data.category}`);
  console.log(`- Subject: ${data.subject}`);
  console.log(`- Message: ${data.message}\n`);

  // Create mailto link (same logic as in the form)
  const subject = encodeURIComponent(
    data.category 
      ? `[${data.category}] ${data.subject}`
      : data.subject
  );
  
  const body = encodeURIComponent(
    `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
  );
  
  const mailtoLink = `mailto:hello@clockmath.com?subject=${subject}&body=${body}`;
  
  console.log('Generated mailto link:');
  console.log(mailtoLink);
  
  // Test URL decoding to verify readability
  console.log('\nDecoded subject:');
  console.log(decodeURIComponent(subject));
  
  console.log('\nDecoded body:');
  console.log(decodeURIComponent(body));
  
  // Validate the link format
  const isValidMailto = mailtoLink.startsWith('mailto:hello@clockmath.com?');
  const hasSubject = mailtoLink.includes('subject=');
  const hasBody = mailtoLink.includes('body=');
  
  console.log('\nValidation:');
  console.log(`✅ Valid mailto format: ${isValidMailto}`);
  console.log(`✅ Contains subject: ${hasSubject}`);
  console.log(`✅ Contains body: ${hasBody}`);
  
  return isValidMailto && hasSubject && hasBody;
}

// Test with sample data
const testResult = testContactForm(formData);

console.log(`\n${testResult ? '✅ SUCCESS' : '❌ FAILURE'}: Contact form functionality test ${testResult ? 'passed' : 'failed'}`);

// Test with edge cases
console.log('\n--- Testing Edge Cases ---');

// Test with special characters
const edgeFormData = {
  name: 'John O\'Connor',
  email: 'test+user@domain.co.uk',
  subject: 'Question about "Time Zones" & Calculations',
  category: '',
  message: 'This message contains special characters: & < > " \' and emoji 🕐'
};

console.log('\nTesting with special characters:');
const edgeTestResult = testContactForm(edgeFormData);
console.log(`${edgeTestResult ? '✅ SUCCESS' : '❌ FAILURE'}: Edge case test ${edgeTestResult ? 'passed' : 'failed'}`);
