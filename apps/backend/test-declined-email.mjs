import 'dotenv/config';
import sendCompetitionEmail from './src/services/competitionEmailService.js';

console.log('Testing declined email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

async function test() {
  try {
    // Test preliminary declined
    console.log('\n📧 Testing PRELIMINARY declined email...');
    const prelimResult = await sendCompetitionEmail.sendEntryDeclined({
      userEmail: 'nishanakila1@gmail.com',
      athleteName: 'Test Athlete',
      competitionName: 'Test Competition',
      entryType: 'preliminary',
      reason: 'Test reason for decline',
      canResubmit: true
    });
    console.log('✅ Preliminary declined email result:', prelimResult);

    // Test final declined
    console.log('\n📧 Testing FINAL declined email...');
    const finalResult = await sendCompetitionEmail.sendEntryDeclined({
      userEmail: 'nishanakila1@gmail.com',
      athleteName: 'Test Athlete',
      competitionName: 'Test Competition',
      entryType: 'final',
      reason: 'Test reason for final decline',
      canResubmit: false
    });
    console.log('✅ Final declined email result:', finalResult);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
}

test();
