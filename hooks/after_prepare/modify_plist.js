// hooks/after_prepare/modify_plist.js
const fs = require('fs');
const path = require('path');
const plist = require('plist');  // Requires the plist package to handle .plist files

module.exports = function(context) {
    const iosPlatformPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
    const appName = getAppName();
    const plistFilePath = path.join(iosPlatformPath, appName, `${appName}-Info.plist`);

    console.log(`Modifying Info.plist at: ${plistFilePath}`);

    if (fs.existsSync(plistFilePath)) {
        // Read the existing Info.plist
        const plistData = fs.readFileSync(plistFilePath, 'utf8');
        const plistJson = plist.parse(plistData);
        console.log(`Readout of JSON-ified Info.plist: ${plistJson}`);

        // Get the app bundle ID from the plist file
        const appBundleId = plistJson.CFBundleIdentifier;

        // Modify CFBundleURLTypes, or add it if it doesn't exist
        if (!plistJson.CFBundleURLTypes) {
            plistJson.CFBundleURLTypes = [];
        }

        // Define the new URL scheme you want to add
        const newUrlScheme = {
            CFBundleURLName: `${appBundleId}`, // Change this to your app's bundle ID
            CFBundleURLSchemes: [`${appBundleId}`, `msauth.${appBundleId}`]  // Replace with your custom scheme
        };

        // Overwrite
        plistJson.CFBundleURLTypes.push(newUrlScheme);

        // Write the updated Info.plist back to disk
        const updatedPlistData = plist.build(plistJson);
        fs.writeFileSync(plistFilePath, updatedPlistData, 'utf8');
        console.log('Info.plist has been updated successfully.');
    } else {
        console.error(`Info.plist not found at ${plistFilePath}`);
    }
};

// Helper function to get the app name
function getAppName() {
    const configXmlPath = path.join(context.opts.projectRoot, 'config.xml');
    const configData = fs.readFileSync(configXmlPath, 'utf8');
    const appNameMatch = configData.match(/<name>([^<]+)<\/name>/);
    return appNameMatch ? appNameMatch[1].trim() : null;
}