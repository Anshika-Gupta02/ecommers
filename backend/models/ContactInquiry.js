import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contactInquirySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const ContactInquiry = mongoose.models.ContactInquiry || mongoose.model('ContactInquiry', contactInquirySchema);
export default ContactInquiry;
