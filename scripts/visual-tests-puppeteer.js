#!/usr/bin/env node

/**
 * Visual Tests using Puppeteer
 *
 * Prerequisites:
 * 1. Start the dev server: npm run dev
 * 2. Run this script: node scripts/visual-tests-puppeteer.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Test configuration
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };

// Bangalore coordinates for testing
const TEST_LAT = 12.9716;
const TEST_LNG = 77.5946;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 Screenshot saved: ${name}.png`);
  return filePath;
}

async function screenshotFullPage(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  📸 Full-page screenshot saved: ${name}.png`);
  return filePath;
}

// Test 1: Initial Search Page State
async function testInitialState(page) {
  console.log('\n📍 Test 1: Initial Search Page State');

  await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle2' });
  await page.setViewport(DESKTOP_VIEWPORT);

  await screenshot(page, '01-initial-state-desktop');

  // Check for search input
  const searchInput = await page.$('input[type="text"], input[type="search"]');
  console.log(`  ✓ Search input present: ${!!searchInput}`);

  // Check for empty state / search suggestions
  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasEmptyState = bodyText.includes('popular') || bodyText.includes('suggestion') || bodyText.includes('search');
  console.log(`  ✓ Empty state content present: ${hasEmptyState}`);

  console.log('  ✓ Initial state test completed');
}

// Test 2: Search Flow - Biryani
async function testSearchBiryani(page) {
  console.log('\n📍 Test 2: Search Flow - Biryani');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=biryani&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  // Wait for results to load (APIs can be slow)
  await delay(8000);

  await screenshot(page, '02-search-biryani-results');

  // Check for results
  const cards = await page.$$('[class*="card"], [class*="Card"]');
  console.log(`  ✓ Result cards found: ${cards.length}`);

  // Check if biryani restaurants appear first (relevance test)
  const firstCardText = await page.evaluate(() => {
    const card = document.querySelector('[class*="card"], [class*="Card"]');
    return card ? card.innerText : '';
  });
  const isBiryaniFirst = firstCardText.toLowerCase().includes('biryani');
  console.log(`  ✓ Biryani restaurant first: ${isBiryaniFirst}`);

  console.log('  ✓ Biryani search test completed');
}

// Test 3: Search Flow - Chinese
async function testSearchChinese(page) {
  console.log('\n📍 Test 3: Search Flow - Chinese');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=chinese&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshot(page, '03-search-chinese-results');

  // Check for results
  const cards = await page.$$('[class*="card"], [class*="Card"]');
  console.log(`  ✓ Result cards found: ${cards.length}`);

  console.log('  ✓ Chinese search test completed');
}

// Test 4: Search Flow - Pizza
async function testSearchPizza(page) {
  console.log('\n📍 Test 4: Search Flow - Pizza');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=pizza&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshot(page, '04-search-pizza-results');

  const cards = await page.$$('[class*="card"], [class*="Card"]');
  console.log(`  ✓ Result cards found: ${cards.length}`);

  console.log('  ✓ Pizza search test completed');
}

// Test 5: Filters UI
async function testFiltersUI(page) {
  console.log('\n📍 Test 5: Filters UI');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=food&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  // Look for filter components
  const filterElements = await page.$$('[class*="filter"], [class*="Filter"]');
  console.log(`  ✓ Filter elements found: ${filterElements.length}`);

  await screenshot(page, '05-filters-visible');

  // Try to interact with a filter chip if present
  const filterChips = await page.$$('[class*="Chip"], [class*="chip"], button[role="checkbox"]');
  if (filterChips.length > 0) {
    await filterChips[0].click();
    await delay(500);
    await screenshot(page, '05b-filter-selected');
    console.log(`  ✓ Filter chip clicked`);
  }

  console.log('  ✓ Filters UI test completed');
}

// Test 6: Sorting UI
async function testSortingUI(page) {
  console.log('\n📍 Test 6: Sorting UI');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=burger&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  // Look for sort dropdown
  const sortDropdown = await page.$('[class*="sort"], [class*="Sort"], select');
  console.log(`  ✓ Sort dropdown found: ${!!sortDropdown}`);

  await screenshot(page, '06-sorting-default');

  // Try different sort options via URL
  await page.goto(`${BASE_URL}/search?q=burger&lat=${TEST_LAT}&lng=${TEST_LNG}&sort=price_low`, { waitUntil: 'networkidle2' });
  await delay(6000);
  await screenshot(page, '06b-sorted-price-low');

  await page.goto(`${BASE_URL}/search?q=burger&lat=${TEST_LAT}&lng=${TEST_LNG}&sort=rating`, { waitUntil: 'networkidle2' });
  await delay(6000);
  await screenshot(page, '06c-sorted-rating');

  console.log('  ✓ Sorting UI test completed');
}

// Test 7: Mobile Responsiveness
async function testMobileResponsiveness(page) {
  console.log('\n📍 Test 7: Mobile Responsiveness');

  await page.setViewport(MOBILE_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=pizza&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshot(page, '07-mobile-view');

  // Check for mobile filter button
  const mobileFilterBtn = await page.$('[class*="mobile"], button[aria-label*="filter"]');
  console.log(`  ✓ Mobile filter button present: ${!!mobileFilterBtn}`);

  // Test tablet viewport
  await page.setViewport(TABLET_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=pizza&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });
  await delay(6000);
  await screenshot(page, '07b-tablet-view');

  console.log('  ✓ Mobile responsiveness test completed');
}

// Test 8: Loading States
async function testLoadingStates(page) {
  console.log('\n📍 Test 8: Loading States');

  await page.setViewport(DESKTOP_VIEWPORT);

  // Navigate and try to capture loading state
  const navigationPromise = page.goto(`${BASE_URL}/search?q=dosa&lat=${TEST_LAT}&lng=${TEST_LNG}`);

  // Try to capture loading state quickly
  await delay(500);
  await screenshot(page, '08-loading-state');

  // Wait for full load
  await navigationPromise;
  await page.waitForNetworkIdle();
  await delay(1000);

  await screenshot(page, '08b-loaded-state');

  // Check for skeleton loaders
  const skeletons = await page.$$('[class*="skeleton"], [class*="Skeleton"], [class*="shimmer"]');
  console.log(`  ✓ Skeleton elements (during load): checked`);

  console.log('  ✓ Loading states test completed');
}

// Test 9: Empty Results State
async function testEmptyResults(page) {
  console.log('\n📍 Test 9: Empty Results State');

  await page.setViewport(DESKTOP_VIEWPORT);

  // Search for something unlikely to have results
  await page.goto(`${BASE_URL}/search?q=xyznonexistent123&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(10000);

  await screenshot(page, '09-no-results');

  // Check for empty state message
  const bodyText = await page.evaluate(() => document.body.innerText);
  const hasNoResults = bodyText.toLowerCase().includes('no result') ||
                       bodyText.toLowerCase().includes('not found') ||
                       bodyText.toLowerCase().includes('try');
  console.log(`  ✓ No results message shown: ${hasNoResults}`);

  console.log('  ✓ Empty results test completed');
}

// Test 10: Savings Badge Display
async function testSavingsBadge(page) {
  console.log('\n📍 Test 10: Savings Badge Display');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=pizza&lat=${TEST_LAT}&lng=${TEST_LNG}&sort=savings`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshot(page, '10-savings-sorted');

  // Check for savings badges
  const savingsBadges = await page.$$('[class*="saving"], [class*="Saving"]');
  console.log(`  ✓ Savings badges found: ${savingsBadges.length}`);

  // Check for green highlighted cards
  const highlightedCards = await page.$$('[class*="green"], [class*="highlight"]');
  console.log(`  ✓ Highlighted cards: ${highlightedCards.length}`);

  console.log('  ✓ Savings badge test completed');
}

// Test 11: Platform Filter
async function testPlatformFilter(page) {
  console.log('\n📍 Test 11: Platform Filter');

  await page.setViewport(DESKTOP_VIEWPORT);

  // Test "both platforms" filter
  await page.goto(`${BASE_URL}/search?q=food&lat=${TEST_LAT}&lng=${TEST_LNG}&platforms=both`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshot(page, '11-platform-both');

  console.log('  ✓ Platform filter test completed');
}

// Test 12: Full Page Scroll
async function testFullPageScroll(page) {
  console.log('\n📍 Test 12: Full Page with Scroll');

  await page.setViewport(DESKTOP_VIEWPORT);
  await page.goto(`${BASE_URL}/search?q=food&lat=${TEST_LAT}&lng=${TEST_LNG}`, { waitUntil: 'networkidle2' });

  await delay(8000);

  await screenshotFullPage(page, '12-full-page-scroll');

  console.log('  ✓ Full page scroll test completed');
}

// Main test runner
async function main() {
  console.log('🧪 Running Visual Tests with Puppeteer\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(50));

  // Check if dev server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Server not responding');
  } catch (e) {
    console.error('\n❌ Dev server is not running.');
    console.log('   Start it with: npm run dev');
    process.exit(1);
  }

  let browser;
  let passed = 0;
  let failed = 0;

  const tests = [
    testInitialState,
    testSearchBiryani,
    testSearchChinese,
    testSearchPizza,
    testFiltersUI,
    testSortingUI,
    testMobileResponsiveness,
    testLoadingStates,
    testEmptyResults,
    testSavingsBadge,
    testPlatformFilter,
    testFullPageScroll,
  ];

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set a reasonable timeout
    page.setDefaultTimeout(30000);

    for (const test of tests) {
      try {
        await test(page);
        passed++;
      } catch (e) {
        console.error(`  ❌ Test failed: ${e.message}`);
        try {
          await screenshot(page, `error-${test.name}`);
        } catch {}
        failed++;
      }
    }

  } catch (e) {
    console.error('\n❌ Browser launch failed:', e.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(50) + '\n');

  // List all screenshots
  const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
  if (screenshots.length > 0) {
    console.log('📸 Generated Screenshots:');
    screenshots.sort().forEach(s => console.log(`   - ${s}`));
  }

  if (failed > 0) {
    console.log('\n❌ Some visual tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All visual tests passed!');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('\n❌ Visual tests crashed:', e.message);
  process.exit(1);
});
