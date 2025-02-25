import { NextApiRequest, NextApiResponse } from 'next';
import { verifyIdToken } from '../../../utils/google';
import { getUserByEmail, createUser } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ message: 'Missing id_token' });
  }

  try {
    // Verify the Google ID token
    const { email, name, picture } = await verifyIdToken(id_token);

    // Check if the user exists in the database
    let user = await getUserByEmail(email);
    if (!user) {
      // Create a new user if not exists
      user = await createUser({ email, name, avatar: picture });
    }

    // Respond with the user data
    return res.status(200).json(user);
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
