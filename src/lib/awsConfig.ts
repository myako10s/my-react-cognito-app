import { Amplify } from "aws-amplify";

type AwsAmplifyConfig = {
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  userPoolDomain: string;
  redirectSignIn: string;
  redirectSignOut: string;
};

const envConfig: AwsAmplifyConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? "",
  userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ?? "",
  identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID ?? "",
  userPoolDomain: import.meta.env.VITE_COGNITO_DOMAIN ?? "",
  redirectSignIn: import.meta.env.VITE_COGNITO_REDIRECT_SIGNIN ?? "",
  redirectSignOut: import.meta.env.VITE_COGNITO_REDIRECT_SIGNOUT ?? ""
};

const requiredKeys: Array<keyof AwsAmplifyConfig> = [
  "userPoolId",
  "userPoolWebClientId",
  "identityPoolId",
  "userPoolDomain",
  "redirectSignIn",
  "redirectSignOut"
];

export const missingAwsEnv = () =>
  requiredKeys.filter((key) => !envConfig[key]).map((key) => key);

let configured = false;

export const ensureAmplifyConfigured = () => {
  if (configured) {
    return;
  }

  const missing = missingAwsEnv();
  if (missing.length) {
    throw new Error(`Missing AWS environment variables: ${missing.join(", ")}`);
  }

  const cleanDomain = envConfig.userPoolDomain.replace(/^https?:\/\//, "").trim();
  const redirectSignIn = envConfig.redirectSignIn
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const redirectSignOut = envConfig.redirectSignOut
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: envConfig.userPoolId,
        userPoolClientId: envConfig.userPoolWebClientId,
        identityPoolId: envConfig.identityPoolId,
        loginWith: {
          oauth: {
            domain: cleanDomain,
            scopes: ["openid", "email", "profile"],
            redirectSignIn,
            redirectSignOut,
            responseType: "code"
          }
        }
      }
    }
  });

  configured = true;
};

export const awsDisplayConfig = envConfig;
