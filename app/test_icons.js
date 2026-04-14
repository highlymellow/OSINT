import * as Phosphor from '@phosphor-icons/react';
import fs from 'fs';

const iconContent = fs.readFileSync('./src/lib/icons.ts', 'utf8');
const exportMatches = iconContent.match(/export \{([^}]+)\}/);
if (exportMatches) {
   const names = exportMatches[1].split(',').map(n => n.trim()).filter(n => n);
   let hasMissing = false;
   names.forEach(n => {
       const [imported] = n.split(' as ');
       if (!Phosphor[imported.trim()]) {
          console.log('MISSING in Phosphor:', imported.trim());
          hasMissing = true;
       }
   });
   if (!hasMissing) console.log('All icons found!');
}
