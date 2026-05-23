import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['product_created', 'product_updated', 'product_deleted', 'transaction_created', 'transaction_deleted', 'user_created', 'user_updated', 'user_deleted', 'user_approved', 'user_rejected', 'stock_low'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
