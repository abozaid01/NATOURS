import express from 'express';
import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!!!' });
});

app.use('/api/v1', apiRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export default server;
