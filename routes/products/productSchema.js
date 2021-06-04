import mongoose from "mongoose"

const {Schema, model} = mongoose

const commentSchema = new Schema({
  comment: {type: String, required: true},
  rate: {type: Number, required: true},
  createdAt: {type: Date}
})


const productSchema = new Schema( {
   name: {type: String, required: true},
   description:{type: String, required: true},
   brand: {type: String, required: true},
   imageUrl: {type: String, default: ""},
   comments: [{type: commentSchema}]
}, {timestamps:true})


productSchema.post("validate", function(error, doc, next ){
  if(error){
    res.status(400).send(error)
  }else{
    next()
  }
})


export default model("product",productSchema)