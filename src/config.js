const config = {
  API_URL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api' 
      : 'https://carfinancezone.shop/api')
};

export default config; 