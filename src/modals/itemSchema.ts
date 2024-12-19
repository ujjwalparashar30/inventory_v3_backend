import mongoose,{Schema} from "mongoose";

export interface Item {
  _id : Schema.Types.ObjectId,
  ean?: string;
  title: string;
  upc?: string;
  gtin?: string;
  asin?: string;
  description?: string;
  brand?: string;
  model?: string;
  dimension?: string;
  weight?: string;
  category?: string;
  currency?: string;
  lowest_recorded_price?: number;
  highest_recorded_price?: number;
  images?: string[]; // Array of strings for image URLs
  elid?: string;
}

const itemSchema = new Schema<Item>({
    ean: { type: String},
  title: { type: String, required: true },
  upc: { type: String},
  gtin : {type : String},
  asin: { type: String },
  description: { type: String },
  brand: { type: String },
  model: { type: String },
  dimension: { type: String }, 
  weight: { type: String },
  category: { type: String },
  currency: { type: String },
  lowest_recorded_price: { type: Number },
  highest_recorded_price: { type: Number },
  images: { type: [String] }, // Array of strings for image URLs
  
  elid: { type: String }
})

export const Item = mongoose.model("Item",itemSchema) 
