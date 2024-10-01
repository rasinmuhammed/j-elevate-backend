const generateEmployeeID = () => {
    // Implement your logic for generating a unique employee ID
    // For example, a combination of letters and numbers
    return 'EMP' + Math.floor(100 + Math.random() * 9000); // Generates an ID like EMP1234
  };
  
  module.exports = { generateEmployeeID };
  