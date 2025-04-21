export const getEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        console.error(`Environment variable ${key} is not set. Please check your .env file.`);
        throw new Error(`Environment variable ${key} is not set. Please check your .env file.`);
    }
    return value;
};

// Проверяем наличие всех необходимых переменных при инициализации
export const checkEnvVars = () => {
    const requiredVars = ['ONLINE_API_KEY'];
    requiredVars.forEach(getEnvVar);
}; 