if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const cloudinary = require('cloudinary').v2;

// Configure cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

async function verifyCloudinaryConnection() {
    console.log('\n=== CLOUDINARY CONNECTION TEST ===');
    console.log('Checking Cloudinary credentials...');

    // Log partial credentials for verification (hiding sensitive parts)
    console.log(`- Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    if (process.env.CLOUDINARY_KEY) {
        const keyLastFour = process.env.CLOUDINARY_KEY.slice(-4);
        console.log(`- API Key: xxxxxxxx${keyLastFour}`);
    } else {
        console.log(`- API Key: NOT FOUND`);
    }
    
    if (process.env.CLOUDINARY_SECRET) {
        const secretLastFour = process.env.CLOUDINARY_SECRET.slice(-4);
        console.log(`- API Secret: xxxxxxxx${secretLastFour}`);
    } else {
        console.log(`- API Secret: NOT FOUND`);
    }
    
    console.log('\nTesting connection to Cloudinary...');
    
    try {
        // Try to get account info - a simple API call to verify credentials
        const result = await cloudinary.api.ping();
        console.log('✅ SUCCESS! Connected to Cloudinary successfully.');
        console.log(`- Status: ${result.status}`);
        
        // Try to list some resources to verify read access
        const folderCheck = await cloudinary.api.root_folders();
        console.log('✅ Successfully retrieved folder information');
        console.log(`- Root folders: ${folderCheck.folders.length}`);
        
        return true;
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to Cloudinary');
        console.error(`- Error Code: ${error.http_code || 'N/A'}`);
        console.error(`- Error Message: ${error.message || 'Unknown error'}`);
        
        // Provide specific troubleshooting advice based on the error
        console.log('\n=== TROUBLESHOOTING TIPS ===');
        
        if (error.http_code === 401) {
            console.log('Authentication error. Your API key or secret may be incorrect.');
        } else if (error.http_code === 403) {
            console.log('Authorization error. Your account may not have permission to perform this action.');
        } else if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
            console.log('One or more Cloudinary environment variables are missing.');
        }
        
        console.log('\nPlease check:');
        console.log('1. Your internet connection is working');
        console.log('2. Your .env file contains the correct Cloudinary credentials');
        console.log('3. Your Cloudinary account is active and not suspended');
        console.log('4. The permissions on your Cloudinary account are sufficient');
        console.log('\nIf problems persist, please contact Cloudinary support.');
        
        return false;
    }
}

// Run the verification
verifyCloudinaryConnection()
    .then(success => {
        if (success) {
            console.log('\nYour Cloudinary configuration appears to be working correctly.');
            console.log('You should be able to upload images without issues.');
        } else {
            console.log('\nPlease fix the Cloudinary connection issues before attempting uploads.');
            process.exit(1); // Exit with error code
        }
    })
    .catch(err => {
        console.error('Unexpected error during verification:', err);
        process.exit(1);
    });
