import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.stockQuantity === 0) {
    this.status = "out-of-stock";
  } else if (this.stockQuantity <= 10) {
    this.status = "low-stock";
  } else {
    this.status = "in-stock";
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
