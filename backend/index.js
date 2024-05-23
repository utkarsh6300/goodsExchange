const app = require("./app.js")

const PORT = process.env.PORT; // You can change this to your desired port

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


