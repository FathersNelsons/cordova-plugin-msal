// hooks/after_prepare/modify_plist.js
const fs = require('fs');
const path = require('path');
const plist = require('plist');  // Requires the plist package to handle .plist files

module.exports = function (context) {
    const rootPath = context.opts.projectRoot;
    const iosPlatformPath = path.join(rootPath, 'platforms', 'ios');
    const appName = getAppName(rootPath);
    const plistFilePath = path.join(iosPlatformPath, appName, `${appName}-Info.plist`);

    console.log(`Modifying Info.plist at: ${plistFilePath}`);

    if (fs.existsSync(plistFilePath)) {
        // Read the existing Info.plist
        const plistData = fs.readFileSync(plistFilePath, 'utf8');
        const plistJson = plist.parse(plistData);

        // Get the app bundle ID from the plist file
        const appBundleId = plistJson.CFBundleIdentifier;

        // Modify CFBundleURLTypes, or add it if it doesn't exist
        if (!plistJson.CFBundleURLTypes) {
            plistJson.CFBundleURLTypes = [];
        }

        // Define the new URL scheme entry
        const newUrlScheme = {
            CFBundleTypeRole: 'Editor',  // Add the CFBundleTypeRole key
            CFBundleURLName: appBundleId,  // Use the app bundle ID
            CFBundleURLSchemes: [appBundleId, `msauth.${appBundleId}`]  // Your schemes
        };

        // Function to check for duplicates
        const mergeSchemes = (existingSchemes, newSchemes) => {
            newSchemes.forEach(scheme => {
                if (!existingSchemes.includes(scheme)) {
                    existingSchemes.push(scheme);
                }
            });
            return existingSchemes;
        };

        // Check if the CFBundleURLName already exists in the array
        let updated = false;
        for (let i = 0; i < plistJson.CFBundleURLTypes.length; i++) {
            const urlType = plistJson.CFBundleURLTypes[i];

            if (urlType.CFBundleURLName === appBundleId) {
                // Ensure that CFBundleURLSchemes is initialized
                if (!urlType.CFBundleURLSchemes) {
                    urlType.CFBundleURLSchemes = [];
                }

                // Merge schemes, ensuring no duplicates
                urlType.CFBundleURLSchemes = mergeSchemes(urlType.CFBundleURLSchemes, newUrlScheme.CFBundleURLSchemes);

                // Update CFBundleTypeRole (if needed)
                if (!urlType.CFBundleTypeRole) {
                    urlType.CFBundleTypeRole = newUrlScheme.CFBundleTypeRole;
                }

                updated = true;
                break;
            }
        }

        // If not updated, add a new entry
        if (!updated) {
            plistJson.CFBundleURLTypes.push(newUrlScheme);
            console.log('Added new URL scheme.');
        } else {
            console.log('Updated existing URL scheme.');
        }

        // Write the updated Info.plist back to disk
        const updatedPlistData = plist.build(plistJson);
        fs.writeFileSync(plistFilePath, updatedPlistData, 'utf8');
        console.log('Info.plist has been updated successfully.');
    } else {
        console.error(`Info.plist not found at ${plistFilePath}`);
    }
};

// Helper function to get the app name
function getAppName(rootPath) {
    const configXmlPath = path.join(rootPath, 'config.xml');
    const configData = fs.readFileSync(configXmlPath, 'utf8');
    const appNameMatch = configData.match(/<name>([^<]+)<\/name>/);
    return appNameMatch ? appNameMatch[1].trim() : null;
}