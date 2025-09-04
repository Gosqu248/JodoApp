import 'dotenv/config';

export default {
    expo: {
        name: "JodoGym App",
        slug: "JodoGym App",
        version: "1.0.0",
        extra: {
            apiUrl: process.env.API_URL,
        },
    },
};
