
export const isDev = () => {
    return process.env.NODE_ENV === 'development';
}

export const isTest = () => {
    return process.env.NODE_ENV === 'test';
}
