import 'dotenv/config';
import sendCompetitionEmail from './src/services/competitionEmailService.js';

console.log('Testing approval email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function test() {
  try {
    const result = await sendCompetitionEmail.sendRegistrationApproval({
      userEmail: 'nishanakila1@gmail.com', // Test with your email
      athleteName: 'Test Athlete',
      competitionName: 'Test Competition',
      competitionDate: 'February 15, 2026',
      preliminaryEntryOpen: true,
      preliminaryStartDate: 'February 10, 2026'
    });
    console.log('✅ Email result:', result);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
}

test();
