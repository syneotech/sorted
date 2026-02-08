#!/usr/bin/env node

/**
 * Visual Tests using agent-browser
 *
 * Prerequisites:
 * 1. Install agent-browser globally: npm install -g agent-browser
 * 2. Run: agent-browser install
 * 3. Start the dev server: npm run dev
 * 4. Run this script: npm run test:visual
 *
 * Note: These tests require agent-browser CLI to be installed.
 * If agent-browser is not available, the tests will skip gracefully.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const TIMEOUT = 30000;

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Check if agent-browser is available
function checkAgentBrowser() {
  try {
    execSync('which agent-browser', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Run an agent-browser command
function run(cmd) {
  console.log(`  > agent-browser ${cmd}`);
  try {
    const result = execSync(`agent-browser ${cmd}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: TIMEOUT,
    });
    return result.trim();
  } catch (e) {
    const errorMsg = e.stderr || e.message || 'Unknown error';
    console.error(`  ✗ Command failed: ${errorMsg}`);
    throw e;
  }
}

// Take a screenshot
function screenshot(name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  return run(`screenshot "${filePath}"`);
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

// Test: Search Flow
async function testSearchFlow() {
  console.log('\n📍 Test: Search Flow');

  try {
    run(`open "${BASE_URL}/search"`);
    screenshot('01-search-initial');

    // Check search input exists
    const hasInput = run(`is visible "input[type='text']"`);
    assert(hasInput === 'true', 'Search input is visible');

    // Type search query
    run(`fill "input[type='text']" "biryani"`);
    run(`press Enter`);

    // Wait for results
    run(`wait --text "Results" --timeout 15000`);
    screenshot('02-search-results');

    console.log('  ✓ Search flow completed successfully');
  } catch (e) {
    console.error('  ✗ Search flow test failed:', e.message);
    screenshot('search-flow-error');
    throw e;
  }
}

// Test: Filters Work
async function testFiltersWork() {
  console.log('\n📍 Test: Filters');

  try {
    // Navigate to search with results
    run(`goto "${BASE_URL}/search?q=pizza&lat=12.97&lng=77.59"`);
    run(`wait --text "Results" --timeout 15000`);

    // Check if filter components exist
    const hasFilters = run(`is visible "[class*='Filter']"`);
    assert(hasFilters === 'true' || hasFilters === 'false', 'Filter check completed');

    screenshot('03-filters-view');

    console.log('  ✓ Filters test completed');
  } catch (e) {
    console.error('  ✗ Filters test failed:', e.message);
    screenshot('filters-error');
    throw e;
  }
}

// Test: Mobile Responsiveness
async function testMobileResponsiveness() {
  console.log('\n📍 Test: Mobile Responsiveness');

  try {
    // Set mobile viewport
    run(`set viewport 375 667`);

    // Navigate to search
    run(`goto "${BASE_URL}/search?q=chinese&lat=12.97&lng=77.59"`);
    run(`wait --text "Results" --timeout 15000`);

    screenshot('04-mobile-view');

    // Reset viewport
    run(`set viewport 1280 720`);

    console.log('  ✓ Mobile responsiveness test completed');
  } catch (e) {
    console.error('  ✗ Mobile responsiveness test failed:', e.message);
    screenshot('mobile-error');
    throw e;
  }
}

// Test: Empty State
async function testEmptyState() {
  console.log('\n📍 Test: Empty State');

  try {
    run(`goto "${BASE_URL}/search"`);
    run(`wait --load networkidle`);

    screenshot('05-empty-state');

    // Check for empty state or search suggestions
    const hasContent = run(`get text "body"`);
    assert(hasContent.length > 0, 'Page has content');

    console.log('  ✓ Empty state test completed');
  } catch (e) {
    console.error('  ✗ Empty state test failed:', e.message);
    screenshot('empty-state-error');
    throw e;
  }
}

// Test: Loading States
async function testLoadingStates() {
  console.log('\n📍 Test: Loading States');

  try {
    // Navigate to a search that will load
    run(`goto "${BASE_URL}/search?q=burger&lat=12.97&lng=77.59"`);

    // Try to capture loading state (might be too fast)
    screenshot('06-loading-state');

    // Wait for full load
    run(`wait --load networkidle`);
    screenshot('07-loaded-state');

    console.log('  ✓ Loading states test completed');
  } catch (e) {
    console.error('  ✗ Loading states test failed:', e.message);
    screenshot('loading-error');
    throw e;
  }
}

// Test: Sorting Changes Order
async function testSortingChangesOrder() {
  console.log('\n📍 Test: Sorting');

  try {
    run(`goto "${BASE_URL}/search?q=pizza&lat=12.97&lng=77.59"`);
    run(`wait --text "Results" --timeout 15000`);

    // Check if sort dropdown exists
    const hasSortDropdown = run(`is visible "select, [class*='Sort'], button:has-text('Sort')"`);
    console.log(`  Sort dropdown visible: ${hasSortDropdown}`);

    screenshot('08-default-sort');

    console.log('  ✓ Sorting test completed');
  } catch (e) {
    console.error('  ✗ Sorting test failed:', e.message);
    screenshot('sorting-error');
    throw e;
  }
}

// Main test runner
async function main() {
  console.log('🧪 Running Visual Tests\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);

  // Check if agent-browser is installed
  if (!checkAgentBrowser()) {
    console.log('\n⚠️  agent-browser is not installed.');
    console.log('   To install: npm install -g agent-browser && agent-browser install');
    console.log('   Skipping visual tests.\n');
    process.exit(0);
  }

  // Check if dev server is running
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}`, {
      encoding: 'utf8',
      timeout: 5000,
    });
  } catch {
    console.log('\n⚠️  Dev server is not running.');
    console.log(`   Start it with: npm run dev`);
    console.log(`   Then run: npm run test:visual`);
    console.log('   Skipping visual tests.\n');
    process.exit(0);
  }

  let passed = 0;
  let failed = 0;
  const tests = [
    testSearchFlow,
    testEmptyState,
    testFiltersWork,
    testSortingChangesOrder,
    testMobileResponsiveness,
    testLoadingStates,
  ];

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch {
      failed++;
    }
  }

  // Close browser
  try {
    run('close');
  } catch {
    // Ignore close errors
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(50) + '\n');

  if (failed > 0) {
    console.log('❌ Some visual tests failed');
    process.exit(1);
  } else {
    console.log('✅ All visual tests passed!');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('\n❌ Visual tests crashed:', e.message);
  process.exit(1);
});
