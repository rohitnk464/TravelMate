try {
    const bcrypt = require('bcryptjs');
    console.log('bcryptjs loaded');
} catch (error) {
    console.error('Error loading bcryptjs:', error);
}
