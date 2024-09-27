// hooks/after_prepare/plugin_inspector.js
const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const appDirectory = context.opts.projectRoot;
    const wwwDir = path.join(appDirectory, 'www');
    const pluginsDir = path.join(appDirectory, 'plugins');
    const platformsDir = path.join(appDirectory, 'platforms');
    const buildStage = context.hook; // Indicates the current stage of the build

    // Log file structure and important paths
    function logFileStructure(dirPath, depth = 0) {
        const indent = ' '.repeat(depth * 2);
        console.log(indent + dirPath);

        if (fs.existsSync(dirPath)) {
            fs.readdirSync(dirPath).forEach(file => {
                const fullPath = path.join(dirPath, file);
                const stats = fs.statSync(fullPath);

                if (stats.isDirectory()) {
                    logFileStructure(fullPath, depth + 1);
                } else {
                    console.log(indent + '  ' + file);
                }
            });
        } else {
            console.log(indent + '[Directory not found]');
        }
    }

    // Log basic info about the build stage
    console.log(`Running hook: ${buildStage}`);
    console.log('App Directory:', appDirectory);
    console.log('www Directory:', wwwDir);
    console.log('Plugins Directory:', pluginsDir);
    console.log('Platforms Directory:', platformsDir);

    // Log the file structure of 'www', 'plugins', and 'platforms'
    console.log('\nFile structure of www Directory:');
    logFileStructure(wwwDir);

    console.log('\nFile structure of Plugins Directory:');
    logFileStructure(pluginsDir);

    console.log('\nFile structure of Platforms Directory:');
    logFileStructure(platformsDir);

    // Log the contents of cordova_plugins.js if it exists
    const cordovaPluginsFile = path.join(wwwDir, 'cordova_plugins.js');
    if (fs.existsSync(cordovaPluginsFile)) {
        console.log('\ncordova_plugins.js found:');
        const pluginData = fs.readFileSync(cordovaPluginsFile, 'utf-8');
        console.log(pluginData);
    } else {
        console.log('cordova_plugins.js not found.');
    }
};