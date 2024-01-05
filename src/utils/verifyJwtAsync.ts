import { verify, Secret, JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  // Structure of decoded token payload
  id: string;
}

// verify and decode JWT asynchronously
export const verifyAsync = (token: string, secret: Secret): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
};
