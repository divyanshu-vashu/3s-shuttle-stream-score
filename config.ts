export const SOCKET_CONFIG = {
    LOCAL_URL: 'wss://tender-instantly-feline.ngrok-free.app/ws',  // Your local IP
    // LOCAL_URL: 'ws://localhost:8080/ws',    // For iOS Simulator
    PRODUCTION_URL: 'wss://appointy-badminton-ws-go.onrender.com/ws',
    CURRENT_ENV: 'development'  // 'development' or 'production'
};

export const getSocketURL = () => {
    return SOCKET_CONFIG.CURRENT_ENV === 'development' 
        ? SOCKET_CONFIG.LOCAL_URL 
        : SOCKET_CONFIG.PRODUCTION_URL;
};