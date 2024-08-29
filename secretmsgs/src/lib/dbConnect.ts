import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connections: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connections.isConnected) {
        console.log("Connection is already established");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        console.log('MongoDB Connected...');
        connections.isConnected = mongoose.connections[0].readyState;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default dbConnect;
