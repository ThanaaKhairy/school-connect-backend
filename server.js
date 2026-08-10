const app = require('./src/app');
const connectDB = require('./src/config/database');

require('dotenv').config();


connectDB();
app.get("/",(req,res)=>{
    res.send("<h1> Welcom to School Communication System</h1>")
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

