const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

// Define the source and destination paths
const SVG_DIRECTORY = path.join(process.cwd(), 'public', 'BuildingMaps');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'rooms.json');

// Recursively finds all SVG files in a given directory
async function getSvgFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getSvgFiles(res) : res;
        })
    );
    return Array.prototype.concat(...files).filter((file) => file.endsWith('.svg'));
}

// Extract room data from SVG files and writes the data to a JSON file
async function extractAllRoomData() {
    try {
        console.log('Starting to scan for SVG files...');
        const svgFiles = await getSvgFiles(SVG_DIRECTORY);
        console.log(`Found ${svgFiles.length} SVG files to process.`);

        const allRoomsData = [];

        for (const file of svgFiles) {
            const svgContent = await fs.readFile(file, 'utf8');
            const $ = cheerio.load(svgContent, { xmlMode: true });

            // Create a clean prefix from the file path for the unique ID
            const relativePath = path.relative(SVG_DIRECTORY, file);
            const filePrefix = relativePath.replace(/\.svg$/, '').replace(/[\\/]/g, '-');

            $('.room-group').each((index, element) => {
                const group = $(element);
                const originalRoomId = group.attr('id');
                const shapeElement = group.find('.room');

                if (originalRoomId && shapeElement.length > 0) {
                    
                    // Unique ID to differentiate common rooms numbers between buildings
                    const uniqueId = `${filePrefix}-${originalRoomId}`;

                    const attributes = {};
                    const shapeAttrs = shapeElement.attr();

                    for (const attrName in shapeAttrs) {
                        // Removes white space characters from polygon data in svg files
                        attributes[attrName] = shapeAttrs[attrName].replace(/\s+/g, ' ').trim();
                    }

                    allRoomsData.push({
                        uniqueId: uniqueId,
                        originalId: originalRoomId,
                        shape: shapeElement.prop('tagName').toLowerCase(),
                        attributes: attributes,
                        sourceFile: relativePath
                    });
                }
            });
        }
        
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(allRoomsData, null, 2));

        console.log(`Success! Extracted data for ${allRoomsData.length} unique rooms to ${OUTPUT_FILE}`);

    } 
    catch (error) {
        console.error('An error occurred while extracting room data:', error);
    }
}

extractAllRoomData();