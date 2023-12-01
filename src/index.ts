import express from 'express';
import dotenv from 'dotenv';
import { genSaltSync, hashSync } from 'bcrypt';
import { StreamChat } from 'stream-chat';

dotenv.config();

const { PORT, STREAM_API_KEY, STREAM_API_SECRET  } = process.env;

// Stream Chat SDK
const client = StreamChat.getInstance(STREAM_API_KEY!, STREAM_API_SECRET);

const app = express();
app.use(express.json());
const salt = genSaltSync(10);

// Stream Chat SDK
interface User {
    id: string;
    email: string;
    hashed_password: string;
}

const USERS: User[] = [];

//register
app.post('/register', async(req, res) => {
    const { email, password } = req.body;
//3 check if user exists autorization
    if (!email || !password) {
        return res.status(400).json({ 
            message: "E-mail ou mot de passe manquant",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            message: "Le mot de passe doit contenir au moins 6 caractères",
        });
    }

    const existingUser = USERS.find((user) => user.email === email);
    if (existingUser) {
        return res.status(400).json({ 
            message: "utilisateur existe déjà",
        });
    }


    try {
        const hashed_password = hashSync(password, salt);
        const id = Math.random().toString(36).slice(2);
        const newUser = {
            id,
            email,
            hashed_password,
        };

        USERS.push(newUser);

        await client.upsertUser({
            id,
            email,
            name: email,

        });
        const token = client.createToken(id);
        return res.status(200).json({
             token, 
             user:{
                id,
                email,
            },
            });


    } catch (err) {
        res.status(500).json({ error: "utilisateur existe déjà"});
    
    }
});

//login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find((user) => user.email === email);
    const hashed_password = hashSync(password, salt);

    if (!user || user.hashed_password !== hashed_password) {
        return res.status(400).json({ 
            message: "email ou mot de passe incorrect",
        });
    }

    const token = client.createToken(user.id);
    return res.status(200).json({
         token, 
         user:{
            id: user.id,
            email: user.email,
        },
        });

  });

app.listen(PORT, () => {
  console.log(`Le serveur écoute sur le port ${PORT}`);
});