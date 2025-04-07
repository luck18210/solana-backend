import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  NextFunction,
  Request,
  Response,
} from 'express';

import { baseConfig } from '@/config';
import router from '@/routes';

dotenv.config();

const PORT = baseConfig.PORT;

const corsOptions: cors.CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
};

const app = express();
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', router);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    console.log("MemeGuradian Server");
    res.send("MemeGuradian Server");
});

// app.use("*", (req: Request, res: Response, next: NextFunction) => {
//     res.send("Invalid Api");
// });

async function beginServing() {
    // console.log("PORT", PORT);
    app.listen(PORT);
    // app.on("error", console.log);
    // app.on("listening", () => console.log(`Serving Express On Port: ${PORT}`));
    return "All Good";
}

beginServing().then(console.log).catch(console.error);