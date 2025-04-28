import mongoose from "mongoose";

const ConnectToDB = async (req, res) => {
  await mongoose.connect(process.env.MONGO_URL, {dbName: 'mind-canvas-blog-app'})
  .then(() => { console.log(`Connected To Database`) })
  .catch((e) => { console.log(`Error connecting Database ${e}`) });
}

export default ConnectToDB;