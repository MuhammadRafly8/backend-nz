module.exports = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')        
    .replace(/[^\w\-]+/g, '')   
    .replace(/\-\-+/g, '-')      
    .replace(/^-+/, '')          
    .replace(/-+$/, '')         
    .concat('-', Date.now().toString().slice(-4)); 
};