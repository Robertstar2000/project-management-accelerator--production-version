// A collection of pure functions for data parsing and transformation.
// In a production environment, these logic functions would likely reside on a backend server
// and be accessed via API endpoints.

export const parseMarkdownTable = (sectionString: string) => {
    if (!sectionString) return [];
    const lines = sectionString.trim().split('\n');
    let headerIndex = -1;
    for (let i = 0; i < lines.length - 1; i++) {
        const currentRow = lines[i];
        const nextRow = lines[i+1];
        if (currentRow.includes('|') && nextRow.match(/^[|\s-:]+$/) && nextRow.includes('-')) {
            headerIndex = i;
            break;
        }
    }
    if (headerIndex === -1) return [];
    const headerLine = lines[headerIndex];
    const dataLines = lines.slice(headerIndex + 2);
    const headers = headerLine.split('|').map(h => h.trim().toLowerCase().replace(/[()]/g, '').replace(/[\s-]+/g, '_'));
    const data = dataLines.map(row => {
        if (!row.includes('|')) return null; 
        const values = row.split('|').map(v => v.trim());
        if (values.length !== headers.length) return null;
        const obj: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            if (header) {
                obj[header] = values[index];
            }
        });
        return obj;
    }).filter(Boolean);
    return data as any[];
};

export const parseImpact = (impactString) => {
    if (!impactString) return { days: 0, cost: 0 };
    const daysMatch = impactString.match(/([+-]?\s*\d+)\s*d/);
    const costMatch = impactString.match(/([+-]?\s*[\d,]+)\s*c/);
    return {
        days: daysMatch ? parseInt(daysMatch[1].replace(/\s/g, ''), 10) : 0,
        cost: costMatch ? parseInt(costMatch[1].replace(/\s|,/g, ''), 10) : 0,
    };
};

export const applyImpact = (baseline, impact) => {
    const newEndDate = new Date(baseline.endDate);
    newEndDate.setDate(newEndDate.getDate() + impact.days);
    return {
        endDate: newEndDate.toISOString().split('T')[0],
        budget: baseline.budget + impact.cost,
    };
};

export const parseResourcesFromMarkdown = (markdownText: string): string[] => {
    if (!markdownText) return [];
    const lines = markdownText.split('\n');
    const roleSectionKeywords = ['roles', 'personnel', 'team members', 'team'];
    const resources = new Set<string>();
    let inRoleSection = false; // Default to false for items before first heading

    for (const line of lines) {
        // If the line is a heading, update our section context.
        if (line.startsWith('#')) {
            const headingText = line.toLowerCase();
            inRoleSection = roleSectionKeywords.some(keyword => headingText.includes(keyword));
        }
        
        // If the line is a bullet point AND we are not in a role section, it's a resource.
        if (line.match(/^[-*]\s+/) && !inRoleSection) {
            const resourceName = line
                .replace(/^[-*]\s+/, '') // remove bullet
                .split(/[:(]/)[0]      // remove descriptions (e.g., ": PMP Certified")
                .replace(/\*\*/g, '')  // remove bold markers
                .trim();
            if (resourceName && resourceName.toLowerCase() !== 'none') {
                resources.add(resourceName);
            }
        }
    }
    return Array.from(resources);
};

export const parseRolesFromMarkdown = (markdownText: string): string[] => {
    if (!markdownText) return [];
    const lines = markdownText.split('\n');
    const roleSectionKeywords = ['required roles', 'roles', 'personnel', 'team members', 'team'];
    let roleLines: string[] = [];
    let sectionStartIndex = -1;
    
    // Find the roles section
    for (const keyword of roleSectionKeywords) {
        const headingRegex = new RegExp(`^#+\\s*.*${keyword}.*`, 'i');
        sectionStartIndex = lines.findIndex(line => headingRegex.test(line));
        if (sectionStartIndex !== -1) break;
    }
    
    if (sectionStartIndex !== -1) {
        // Extract lines until next heading or end of document
        let sectionEndIndex = lines.findIndex((line, i) => i > sectionStartIndex && line.match(/^#+/));
        if (sectionEndIndex === -1) sectionEndIndex = lines.length;
        roleLines = lines.slice(sectionStartIndex + 1, sectionEndIndex)
            .filter(line => line.trim().match(/^[-*]\s+/));
    }
    
    // Fallback: if no section found, look for first bulleted list
    if (roleLines.length === 0) {
        let foundList = false;
        for (const line of lines) {
            if (line.trim().match(/^[-*]\s+/)) {
                foundList = true;
                roleLines.push(line);
            } else if (foundList && line.trim() === '') break;
        }
    }
    
    const roles = new Set<string>();
    for (const line of roleLines) {
        // Remove bullet, bold markers, and extract role name before colon or parenthesis
        let roleName = line
            .replace(/^\s*[-*]\s+/, '')  // Remove bullet and leading whitespace
            .replace(/\*\*/g, '')         // Remove bold markers
            .split(/[:(]/)[0]             // Split on colon or opening parenthesis
            .trim();
        
        // Skip empty lines and "None" entries
        if (roleName && roleName.toLowerCase() !== 'none') {
            roles.add(roleName);
        }
    }
    
    console.log('Parsed roles:', Array.from(roles));
    return Array.from(roles);
};