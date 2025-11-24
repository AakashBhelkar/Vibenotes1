import 'dotenv/config';

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT}`);
    }
});
