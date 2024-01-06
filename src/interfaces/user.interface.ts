interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'admin' | 'lead-guide' | 'guide';
  active: boolean;
  password: string | undefined;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date | number;
  passwordResetToken: string | undefined;
  passwordResetTokenExpires: Date | undefined;
  __v: number | undefined;
  comparePassword(plain: string, hashed: string): Promise<boolean>;
  passwordChangedAfter(jwtTimestamp: number): boolean;
  createPasswordResetToken(): Promise<string>;
}

export default User;
