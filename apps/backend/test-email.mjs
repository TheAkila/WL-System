import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing WL-System Email Service');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    
    const { default: emailService } = await import('./src/services/competitionEmailService.js');
    
    console.log('\n📧 Sending test registration approval email...');
    const result = await emailService.sendRegistrationApproval({
      userEmail: process.env.EMAIL_USER || 'test@example.com',
      athleteName: 'Test Athlete',
      competitionName: 'Test Competition 2026',
      competitionDate: 'Saturday, February 15, 2026',
      preliminaryEntryOpen: true,
      preliminaryStartDate: 'February 8, 2026'
    });
    
    console.log('✅ Result:', result);
    console.log('\n✅ Email test completed! Check inbox:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmail();
