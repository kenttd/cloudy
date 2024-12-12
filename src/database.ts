import mongoose, { ConnectOptions } from "mongoose";

let isConnected = false;

const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    console.log("Using existing database connection");
    return mongoose; // Return mongoose instance if already connected
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      console.log("Using existing database connection");
      return mongoose;
    }

    const db = await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);

    isConnected = db.connections[0].readyState === 1; // Check if connected successfully
    console.log("Successfully connected to MongoDB Atlas!");

    return mongoose; // Return the mongoose instance after connecting
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // process.exit(1); // Exit the process if the connection fails
  }
};

export default connectDB;
