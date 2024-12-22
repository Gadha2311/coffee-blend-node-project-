
const mongoose=require("mongoose")
0/8
// database connecting 
const connect=async()=>{
    try {
        mongoose.connect("mongodb+srv://gadhavenu2311:gadha%40123@cluster0.5wwfa.mongodb.net/coffeeBlend")
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
