import { Schema, model, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import IUser from '../interfaces/user.interface';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please Enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please Enter your password'],
    minLength: [8, 'password name must be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: Schema.Types.Mixed,
    required: [true, 'Please Confirm your password'],
    validate: {
      // NOTE: when updating it always returns flase so it won't update, (USE .save() instead) or use findByIdAndUpdate with non senstive password changes (normal data)
      validator: function (this: IUser, value: string) {
        return value === this.password;
      },
      message: `Passwords are not the same!`,
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//================ Document Middlewares =======================

// NOTE: pre('save') middleware runs before .save() and .create(), but NOT insertMany(), findByIdAndUpdate(), ...

// (NEW CREATION) Hash the Password before sving it into DB
userSchema.pre('save', async function (next) {
  // Check if the 'password' field has been modified; if not, skip to the next middleware
  if (!this.isModified('password')) return next();

  // If 'password' has been modified, hash the password using bcrypt with a cost factor of 12
  (this.password as string) = await bcrypt.hash(this.password as string, 12);

  // Avoid storing 'passwordConfirm' field in the DB to by setting its value to undefined
  this.passwordConfirm = undefined;

  next();
});

// (UPDATING) Update changedPasswordAt property for the user when Reseting Password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // Decrease 1 second because saving to DB is slower than issuing new JWt
  next();
});

//================ Query Middlewares =======================

// Deleting User
userSchema.pre<Query<IUser[] | IUser | null, IUser>>(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//================ Document Methods =======================

userSchema.methods.comparePassword = async function (plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
};

// Determines if the user's password has been changed after the issuance of a JWT token.
userSchema.methods.passwordChangedAfter = function (jwtTimestamp: number): boolean {
  // Check if the user has a recorded password change timestamp
  if (this.passwordChangedAt) {
    // Compare the timestamp of the last password change with the JWT issuance timestamp
    return this.passwordChangedAt.getTime() / 1000 > jwtTimestamp;
  }

  // the user hasn't changed their password since the JWT token was issued
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  // Create Random reset password
  const resetToken = randomBytes(32).toString('hex');

  // Hash it and store it into the DB
  this.passwordResetToken = createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Expires after 10 min

  // Save the Hased Reset Password into the DB
  await this.save({ validateBeforeSave: false });

  // Return plain reset token, to send via email to user
  return resetToken;
};

const User = model('User', userSchema);
export default User;
