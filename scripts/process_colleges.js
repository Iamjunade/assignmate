import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statesDir = path.join(__dirname, '../states');
const outputFile = path.join(__dirname, '../public/colleges.json');

// Helper to convert string to Title Case
const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const processColleges = () => {
    try {
        const files = fs.readdirSync(statesDir);
        let allColleges = [];

        console.log(`Found ${files.length} files in ${statesDir}`);

        files.forEach(file => {
            if (path.extname(file) === '.json') {
                const filePath = path.join(statesDir, file);
                console.log(`Processing ${file}...`);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                if (Array.isArray(data)) {
                    const colleges = data.map(item => ({
                        id: item.aicte_id || `gen-${Math.random().toString(36).substr(2, 9)}`,
                        name: toTitleCase(item.institute_name),
                        university: toTitleCase(item.university),
                        state: toTitleCase(item.state),
                        district: toTitleCase(item.district),
                        type: toTitleCase(item.institution_type)
                    }));
                    allColleges = allColleges.concat(colleges);
                }
            }
        });

        // Deduplicate based on name and university
        const uniqueColleges = [];
        const seen = new Set();

        allColleges.forEach(college => {
            const key = `${college.name.toLowerCase()}|${college.university.toLowerCase()}|${college.state.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueColleges.push(college);
            }
        });

        console.log(`Total colleges found: ${allColleges.length}`);
        console.log(`Unique colleges after deduplication: ${uniqueColleges.length}`);

        fs.writeFileSync(outputFile, JSON.stringify(uniqueColleges, null, 2));
        console.log(`Successfully wrote to ${outputFile}`);

    } catch (err) {
        console.error('Error processing colleges:', err);
    }
};

processColleges();
