#!/usr/bin/env node

/**
 * Standalone GitHub Copilot Connection Test
 *
 * Verifies that the local Node.js environment can authenticate with GitHub Copilot
 * and obtain a real AI response using the official @github/copilot-sdk.
 */

import { CopilotService } from '../services/copilotService.js';

async function runTest() {
  console.log('🤖 ==========================================');
  console.log('   GitHub Copilot SDK Connection Test');
  console.log('==========================================\n');

  const isMock = process.env.COPILOT_MOCK === 'true';
  if (isMock) {
    console.log('⚠️ Running in MOCK MODE (COPILOT_MOCK=true). No real requests will be made.\n');
  } else {
    console.log('🌐 Mode: REAL LIVE CONNECTION (using signed-in user credentials)\n');
  }

  const service = new CopilotService({
    timeoutMs: 35000
  });

  try {
    console.log('1. Starting Copilot service and checking authentication...');
    await service.start();

    const auth = await service.getAuthStatus();
    console.log(`   - Authenticated: ${auth.isAuthenticated ? 'YES' : 'NO'}`);
    console.log(`   - Auth Type:     ${auth.authType}`);
    console.log(`   - User Login:    ${auth.login || 'N/A'}`);

    if (!auth.isAuthenticated && !isMock) {
      throw new Error(
        `User is not authenticated with GitHub Copilot.\n` +
        `Please authenticate first using the Copilot CLI or GitHub CLI:\n` +
        `  Run: npx @github/copilot login`
      );
    }

    const testPrompt = 'Explain what Cumulative Layout Shift means in one sentence.';
    console.log(`\n2. Submitting test prompt:`);
    console.log(`   "${testPrompt}"\n`);
    console.log('   Waiting for response from GitHub Copilot...');

    const startTime = Date.now();
    const response = await service.generateResponse(testPrompt);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n3. Received response (${elapsedSec}s):`);
    console.log('--------------------------------------------------');
    console.log(response);
    console.log('--------------------------------------------------\n');

    if (!response || response.trim().length === 0) {
      throw new Error('Received an empty response from Copilot.');
    }

    console.log('✅ Connection test PASSED successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Connection test FAILED:');
    console.error(`   ${err.message}\n`);
    process.exit(1);
  } finally {
    console.log('4. Cleaning up client resources...');
    try {
      await service.stop();
      console.log('   Client stopped cleanly.\n');
    } catch (cleanupErr) {
      console.warn('   Warning during stop:', cleanupErr.message);
    }
  }
}

runTest();
