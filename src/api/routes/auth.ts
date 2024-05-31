import { UserPermissionRepository } from './../repository/oracle/UserPermissionRepository';
import { Express, NextFunction, Request, Response } from "express"
import session from 'express-session';
import { AuthUser } from "../models/auth";
import { AUTH_REDIRECT, FRONTEND_URL } from "../config";
import axios from 'axios';
import knex from "knex";
import { SCHEMA_GENERAL, REDIS_CONFIG } from "../config";
import { helper } from "../utils";
const redis = require('redis');
const RedisStore = require("connect-redis").default
var RateLimit = require('express-rate-limit');
const {auth} = require('express-openid-connect')
const userRepo = new UserPermissionRepository();


//Configure redis client
const redisClient = redis.createClient({ 
    url: REDIS_CONFIG.url
});

redisClient.connect().catch(console.error)

redisClient.on('error', function(err: string) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function(err: string) {
    console.log('Connected to redis successfully');
});

// Initialize store.
let redisStore = new RedisStore({
    client: redisClient,
    prefix: "hss-backend-redis:",
})


export function configureAuthentication(app: Express) {
    app.use(RateLimit({
        windowMs: 1*60*1000, // 1 minute
        max: 5000
    }));

    app.use(
        session({
            store: redisStore,
            secret: REDIS_CONFIG.secret,
            resave: false,
            saveUninitialized: false,
        })
    )

    app.use(auth({
        authRequired: false,
        auth0Logout: false,
        authorizationParams: {
            response_type: 'code',
            audience: '',
            scope: 'openid profile email',
        },
        routes: {
            login: "/api/auth/login",
            //logout: "/api/auth/logout",
            postLogoutRedirect: FRONTEND_URL
        }
    }));

    app.use("/", async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.oidc.isAuthenticated()) {
                req.user = {
                    oid_user: AuthUser.fromOpenId(req.oidc.user),
                    db_user: await userRepo.getUserByEmail(req.oidc.user.email)
                };
                (req.session as any).user = req.user;
            }

            next();
        } catch(e) {
            console.log(e);  // debug if needed
            res.send( {
                status: 400,
                message: 'Request could not be processed'
            });
        }
    });

    app.get("/", async (req: Request, res: Response) => {
        try {
            if (req.oidc.isAuthenticated()) {
                let user = AuthUser.fromOpenId(req.oidc.user) as AuthUser;
                req.user = {
                    oid_user: user,
                    db_user: await userRepo.getUserByEmail(req.oidc.user.email)
                };

                let logFields = {
                    ACTION_TYPE: 1,
                    TITLE: "Login",
                    SCHEMA_NAME: SCHEMA_GENERAL,
                    USER_ID: req.user.db_user.user.id
                };

                let loggedAction = helper.insertLog(logFields);

                if(!loggedAction){
                    res.send( {
                        status: 400,
                        message: 'The action could not be logged'
                    });
                }

                res.redirect(AUTH_REDIRECT);
            }
            else {
                // this is hard-coded to accomodate strage behaving in sendFile not allowing `../` in the path.
                // this won't hit in development because web access is served by the Vue CLI - only an issue in Docker
                res.sendFile("/home/node/app/dist/web/index.html");
            }
        } catch(e) {
            console.log(e);  // debug if needed
            res.send( {
                status: 400,
                message: 'Request could not be processed'
            });
        }
    });

    app.get("/api/auth/isAuthenticated", (req: Request, res: Response) => {
        try {
            if (req.oidc.isAuthenticated()) {
                return res.send({ data: req.user });
            }

            return res.status(401).send();
        } catch(e) {
            console.log(e);  // debug if needed
            res.send( {
                status: 400,
                message: 'Request could not be processed'
            });
        }
    });

    app.get('/api/auth/logout', async (req: any, res: Response) => {
        const claims = req.oidc.idTokenClaims;

        if (claims) {
            try {

                const url = `${claims.iss}v2/logout?returnTo=${FRONTEND_URL}&client_id=${claims.aud}`;
                console.log("URL ", url);

                const result = await axios.get(url);
                if (result.status === 200) {

                    //Delete session cookies
                    req.appSession = undefined;
                    res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: true });
                    res.clearCookie('appSession', { path: '/', httpOnly: true, secure: true });

                    if (req.session) {
                        req.session.destroy((err: any) => {
                            if (err) {
                                console.error('Error destroying session:', err);
                                return res.status(500).send({
                                    error: {
                                        message: 'Failed to destroy session',
                                    }
                                });
                            }

                            res.status(200).send({
                                data: {
                                    logout: true,
                                    redirect: AUTH_REDIRECT,
                                    logoutExternalUrl: url,
                                },
                            });
                        });
                    } else {
                        res.status(200).send({
                            data: {
                                logout: true,
                                redirect: AUTH_REDIRECT,
                            },
                        });
                    }
                }
            } catch (error: any) {
                console.log(error);
                return res.status(error.response?.status || 500).send({
                    error: {
                        message: 'Logout failed',
                    },
                });
            }

        }

    });
}

export function EnsureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.oidc.isAuthenticated()) {
        return next();
    }

    res.status(401).send("Not authenticated"); //;.redirect('/api/auth/login');
}