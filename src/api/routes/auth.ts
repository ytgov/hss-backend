import { UserPermissionRepository } from './../repository/oracle/UserPermissionRepository';
import { Express, NextFunction, Request, Response } from "express"
import * as ExpressSession from "express-session";
import { AuthUser } from "../models/auth";
import { AUTH_REDIRECT, FRONTEND_URL } from "../config";
import axios from 'axios';
import knex from "knex";
import { DB_CONFIG_DENTAL, SCHEMA_GENERAL } from "../config";
import { helper } from "../utils";
var RateLimit = require('express-rate-limit');

const {auth} = require('express-openid-connect')
const userRepo = new UserPermissionRepository();
const db = knex(DB_CONFIG_DENTAL);

export function configureAuthentication(app: Express) {
  app.use(RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5000
  }));
  app.use(ExpressSession.default({
      secret: 'supersecret',
      resave: true,
      saveUninitialized: true
  }));

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
      if (req.oidc.isAuthenticated()) {
          req.user = {
            oid_user: AuthUser.fromOpenId(req.oidc.user),
            db_user: await userRepo.getUserByEmail(req.oidc.user.email)
          };
          (req.session as any).user = req.user;
      }

      next();
  });

  app.get("/", async (req: Request, res: Response) => {
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
  });

  app.get("/api/auth/isAuthenticated", (req: Request, res: Response) => {
    if (req.oidc.isAuthenticated()) {
        return res.send({ data: req.user });
    }

    return res.status(401).send();
  });

  app.get('/api/auth/logout', async (req: any, res) => {
    const claims = req.oidc.idTokenClaims;
    if (claims) {
        const url = `${claims.iss}v2/logout?client_id=${claims.aud}`;
        const result = await axios.get(url);
        if (result.data === "OK") {
            req["appSession"] = undefined;
            req.session.destroy();
            res.status(200);
            res.send({
                data: {
                    logout: true,
                    redirect: AUTH_REDIRECT
                }
            })
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