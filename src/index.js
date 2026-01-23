// src\index.js

import dotenv from "dotenv";
import app from "./app.js";
import connectMongoDb from "./db/connection.js";

const PORT = process.env.PORT || 8000;


dotenv.config({ path: "./.env" });

connectMongoDb(process.env.MONGODB_URL)
  .then(() => {
    // Only start listening once DB is connected
    app.listen(PORT, () => {
      console.log(`✅ Server is up and running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Failed to connect MongoDB:", err);
    process.exit(1);
  });











// // src\index.js
// import dotenv from "dotenv";


// dotenv.config({path: "./.env",}); 

// import app from "./app.js";
// import connectMongoDb from "./db/connection.js";



// const PORT = process.env.PORT || 8000;

// connectMongoDb(process.env.MONGODB_URL)

// .then(app.listen(PORT,()=>{
//   console.log("✅ Server is up and running on PORT ${PORT}");
// }))

// .catch(()=>{
//   console.log("❌ Failed to connect MongoDB . Exiting....");
//   process.exit(1);
   
// })

// // --------- PORT LISTENER ---------
// app.listen(PORT, ()=>{
//   console.log(`✅ Server is up and running on PORT ${PORT}`);
  
// })
