import mongoose from "mongoose"

const mongoDBConnection = async () => {
    try{
    await mongoose.connect(process.env.MONGODB_CONNECTION, {
        dbName: "Cluster-Coder"
    })
    console.log("Base de datos conectada")
    }catch (error){
    console.log(error)
    process.exit(1)
    }
}

export default mongoDBConnection;