// Script to replace all EXPSK/Explorer Shack references with EXPSK/Explorer Shack
const fs = require('fs');
const path = require('path');

const replacements = [
  // API references
  { from: /expskBookingReference/g, to: 'expskBookingReference' },
  { from: /expskActivityReference/g, to: 'expskActivityReference' },
  { from: /EXPSK-Option-ID/g, to: 'EXPSK-Option-ID' },
  { from: /EXPSK1B2D34GHI/g, to: 'EXPSK1B2D34GHI' },
  { from: /EXPSK189H3K1/g, to: 'EXPSK189H3K1' },
  { from: /EXPSK2RA9W579V/g, to: 'EXPSK2RA9W579V' },
  
  // Comments and descriptions
  { from: /Explorer Shack Compatible/g, to: 'Explorer Shack Compatible' },
  { from: /Explorer Shack API/g, to: 'Explorer Shack API' },
  { from: /Explorer Shack booking flow/g, to: 'Explorer Shack booking flow' },
  { from: /Explorer Shack patterns/g, to: 'Explorer Shack patterns' },
  { from: /Explorer Shack style/g, to: 'Explorer Shack style' },
  { from: /Explorer Shack layout/g, to: 'Explorer Shack layout' },
  { from: /Explorer Shack's/g, to: 'Explorer Shack\'s' },
  { from: /Explorer Shack/g, to: 'Explorer Shack' },
  
  // Variable names and identifiers
  { from: /expsk/g, to: 'expsk' },
  { from: /EXPSK/g, to: 'EXPSK' },
  
  // URLs and domains
  { from: /getyourguide\.com/g, to: 'explorershack.com' },
  { from: /supplier-api\.getyourguide\.com/g, to: 'supplier-api.explorershack.com' },
  
  // Specific caps and limits
  { from: /EXPSK cap/g, to: 'EXPSK cap' },
  { from: /internal Explorer Shack cap/g, to: 'internal Explorer Shack cap' }
];

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(replacement => {
      if (replacement.from.test(content)) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!['node_modules', '.git', '.vscode'].includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      // Process JavaScript, HTML, CSS, and Markdown files
      const ext = path.extname(item).toLowerCase();
      if (['.js', '.html', '.css', '.md', '.json', '.yaml', '.yml'].includes(ext)) {
        replaceInFile(fullPath);
      }
    }
  });
}

// Start processing from the current directory
const startDir = path.join(__dirname, '..');
console.log('Starting EXPSK to EXPSK replacement...');
processDirectory(startDir);
console.log('Replacement complete!');
