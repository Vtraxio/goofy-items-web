import {MyApp} from "./types";
import {hc} from "hono/client";

export const client = hc<MyApp>("http://localhost:3000");