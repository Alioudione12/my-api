"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = require("bcrypt");
const stream_chat_1 = require("stream-chat");
dotenv_1.default.config();
const { PORT, STREAM_API_KEY, STREAM_API_SECRET } = process.env;
// Stream Chat SDK
const client = stream_chat_1.StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
const app = (0, express_1.default)();
app.use(express_1.default.json());
const salt = (0, bcrypt_1.genSaltSync)(10);
const USERS = [];
//register
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const hashed_password = (0, bcrypt_1.hashSync)(password, salt);
        const id = Math.random().toString(36).slice(2);
        const newUser = {
            id,
            email,
            hashed_password,
        };
        USERS.push(newUser);
        yield client.upsertUser({
            id,
            email,
            name: email,
        });
        const token = client.createToken(id);
        return res.status(200).json({
            token,
            user: {
                id,
                email,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "utilisateur existe déjà" });
    }
}));
//login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find((user) => user.email === email);
    const hashed_password = (0, bcrypt_1.hashSync)(password, salt);
    if (!user || user.hashed_password !== hashed_password) {
        return res.status(400).json({
            message: "email ou mot de passe incorrect",
        });
    }
    const token = client.createToken(user.id);
    return res.status(200).json({
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    });
});
app.listen(PORT, () => {
    console.log(`Le serveur écoute sur le port ${PORT}`);
});
//# sourceMappingURL=index.js.map