import { createYoga } from 'graphql-yoga';
import { schema } from './schema';
import express from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
const app = express();
const yoga = createYoga({ schema })

export const secured = (req: any, res: any, next: any) => expressjwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 1,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  getToken: (req: any) => {
    return req.headers.authorization.replace('Bearer ', '');
  },
  audience: process.env.AUTH0_AUDIENCE,
  algorithms: ['RS256'],
})(req, res, next) as Promise<void>

app.use('/graphql', secured, yoga)


app.listen(80, () => {
  console.info('Server is running on http://localhost:4200/graphql')
})