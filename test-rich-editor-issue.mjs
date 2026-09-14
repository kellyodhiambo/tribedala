// This simulates what the frontend form does

// When user enters data:
const formData = {
  title: 'My First Blog',
  slug: 'my-first-blog',
  excerpt: 'This is a test',
  content: '<p>I typed something in the rich editor</p>',
  category: 'Technology',
  cover_image: 'https://example.com/image.jpg',
  status: 'published'
};

// The validation that happens on submit
function validateForm(form) {
  const titleTrimmed = form.title.trim();
  const contentTrimmed = form.content.trim();
  
  console.log('📝 Form Validation:');
  console.log('  Title:', form.title);
  console.log('  Title (trimmed):', titleTrimmed);
  console.log('  Title (truthy):', !!titleTrimmed);
  console.log('');
  console.log('  Content:', form.content);
  console.log('  Content (trimmed):', contentTrimmed);
  console.log('  Content (truthy):', !!contentTrimmed);
  console.log('');
  
  // This is the check from the code
  if (!titleTrimmed || !contentTrimmed) {
    console.log('❌ VALIDATION FAILED: Title and content are required.');
    return false;
  }
  
  console.log('✅ VALIDATION PASSED');
  return true;
}

console.log('Test 1: Valid form');
console.log('==================');
validateForm(formData);

console.log('\n\nTest 2: Empty content (like if RichEditor returns empty)');
console.log('====================================================');
const emptyContentForm = { ...formData, content: '' };
validateForm(emptyContentForm);

console.log('\n\nTest 3: HTML-only content (no text)');
console.log('====================================');
const htmlOnlyForm = { ...formData, content: '<p></p>' };
validateForm(htmlOnlyForm);

console.log('\n\nTest 4: Whitespace content');
console.log('===========================');
const whitespaceForm = { ...formData, content: '   ' };
validateForm(whitespaceForm);
