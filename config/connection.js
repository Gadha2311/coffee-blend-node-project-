
const mongoose=require("mongoose")

// database connecting 
const connect=async()=>{
    try {
        mongoose.connect("mongodb+srv://gadha:gadha123@cluster0.raczqtl.mongodb.net/coffeee")
        .then(console.log("Mongo db connected"))
        .catch((err)=>console.log(err))
    } catch (error) {
        console.log(error);
        res.send(error)
    }

}
module.exports={
    connect
}
