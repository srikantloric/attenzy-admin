import { createContext, useEffect, useReducer, type ReactElement } from 'react';

// third-party
import { CognitoUser, CognitoUserPool, CognitoUserSession, CognitoUserAttribute, AuthenticationDetails } from 'amazon-cognito-identity-js';

// project-imports
import { LOGIN, LOGOUT } from '@/contexts/auth-reducer/actions';
import authReducer from '@/contexts/auth-reducer/auth';

// types
import type { AWSCognitoContextType, InitialLoginContextProps, UpdateProfileInput } from '@/types/auth';
import Loader from '@/components/Loader';

// constant
const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

export const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_APP_AWS_POOL_ID || '',
  ClientId: import.meta.env.VITE_APP_AWS_APP_CLIENT_ID || ''
});

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
  } else {
    localStorage.removeItem('serviceToken');
  }
};

// ==============================|| AWS COGNITO - CONTEXT & PROVIDER ||============================== //

const AWSCognitoContext = createContext<AWSCognitoContextType | null>(null);

export const AWSCognitoProvider = ({ children }: { children: ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const buildUserFromSession = (session: CognitoUserSession) => {
    const idToken = session.getIdToken();
    const payload = idToken.decodePayload();
    const avatar = payload.picture || payload['custom:profilePhoto'] || payload.image;

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split("@")[0],
      avatar,
      image: avatar,
      role: payload["cognito:groups"]?.[0],
      partnerId: payload["custom:partnerId"],
      orgId: payload["custom:orgId"],
    };
  };


  useEffect(() => {
    const init = async () => {
      try {
        const cognitoUser = userPool.getCurrentUser();

        if (!cognitoUser) {
          dispatch({ type: LOGOUT });
          return;
        }

        cognitoUser.getSession((err: any, session: CognitoUserSession) => {
          if (err || !session.isValid()) {
            dispatch({ type: LOGOUT });
            return;
          }

          const user = buildUserFromSession(session);

          setSession(session.getAccessToken().getJwtToken());

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              isInitialized: true,
              user,
            },
          });

        });
      } catch (error) {
        console.error(error);
        dispatch({ type: LOGOUT });
      }
    };

    init();
  }, []);

  const login = async (username: string, password: string) => {
    const usr = new CognitoUser({
      Username: username,
      Pool: userPool
    });

    const authData = new AuthenticationDetails({
      Username: username,
      Password: password
    });

    return new Promise<any>((success, rej) => {
      usr.authenticateUser(authData, {
        onSuccess: (session: CognitoUserSession) => {
          setSession(session.getAccessToken().getJwtToken());

          const user = buildUserFromSession(session);

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              isInitialized: true,
              user,
            },
          });


          success(session);
        },

        onFailure: (err) => {
          rej(err);
        },
        newPasswordRequired: (userAttributes: Record<string, any>) => {
          console.log("New Password required")
          // ❌ Remove attributes Cognito does NOT accept back
          delete userAttributes.email;
          delete userAttributes.email_verified;
          delete userAttributes.phone_number_verified;

          // ✅ Call this AFTER user enters new password
          usr.completeNewPasswordChallenge(
            password,            // new password entered by user
            userAttributes,      // cleaned attributes
            {
              onSuccess: (session) => {
                setSession(session.getAccessToken().getJwtToken());

                const user = buildUserFromSession(session);

                dispatch({
                  type: LOGIN,
                  payload: {
                    isLoggedIn: true,
                    isInitialized: true,
                    user,
                  },
                });


                success(session);
              },
              onFailure: (err) => {
                rej(err);
              },
            }
          );
        }
      });
    });
  };

  const register = (email: string, password: string, firstName: string, lastName: string) =>
    new Promise((success, rej) => {
      userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({ Name: 'email', Value: email }),
          new CognitoUserAttribute({ Name: 'name', Value: `${firstName} ${lastName}` })
        ],
        [],
        async (err, result) => {
          if (err) {
            rej(err);
            return;
          }
          localStorage.setItem('email', email);
          success(result);
        }
      );
    });

  const logout = () => {
    const loggedInUser = userPool.getCurrentUser();
    if (loggedInUser) {
      setSession(null);
      loggedInUser.signOut();
      dispatch({ type: LOGOUT });
    }
  };

  const forgotPassword = async (email: string) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool
    });
    user.forgotPassword({
      onSuccess: function () { },
      onFailure: function () { }
    });
  };

  const resetPassword = async (verificationCode: string, newPassword: string) => {
    const email = localStorage.getItem('email');
    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });
    return new Promise((resolve, reject) => {
      user.confirmPassword(verificationCode, newPassword, {
        onSuccess: function (data) {
          localStorage.removeItem('email');
          resolve(data);
        },
        onFailure: function (error) {
          reject(error.message);
        }
      });
    });
  };

  const codeVerification = async (verificationCode: string) => {
    const email = localStorage.getItem('email');
    if (email === null || email === undefined) {
      return new Promise((_, reject) => {
        reject('Username and Pool information are required');
      });
    }

    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });

    return new Promise((resolve, reject) => {
      user.confirmRegistration(verificationCode, true, (error, result) => {
        if (error) {
          reject(error.message || JSON.stringify(error));
          return;
        } else {
          localStorage.removeItem('email');
          resolve(result);
        }
      });
    });
  };

  const resendConfirmationCode = async () => {
    const email = localStorage.getItem('email');
    if (email === null || email === undefined) {
      return new Promise((_, reject) => {
        reject('Username and Pool information are required');
      });
    }

    const user = new CognitoUser({
      Username: email as string,
      Pool: userPool
    });

    return new Promise((resolve, reject) => {
      user.resendConfirmationCode((error, result) => {
        if (error) {
          reject(error.message || JSON.stringify(error));
          return;
        } else {
          resolve(result);
        }
      });
    });
  };

  const updateProfile = async (payload: UpdateProfileInput) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      throw new Error('No active user session');
    }

    await new Promise<void>((resolve, reject) => {
      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session?.isValid()) {
          reject(err || new Error('Invalid session'));
          return;
        }
        resolve();
      });
    });

    const attributes: CognitoUserAttribute[] = [];

    if (typeof payload.name === 'string' && payload.name.trim()) {
      attributes.push(new CognitoUserAttribute({ Name: 'name', Value: payload.name.trim() }));
    }

    if (typeof payload.avatar === 'string' && payload.avatar.trim()) {
      attributes.push(new CognitoUserAttribute({ Name: 'picture', Value: payload.avatar.trim() }));
    }

    if (!attributes.length) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      cognitoUser.updateAttributes(attributes, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    const nextUser = state.user
      ? {
        ...state.user,
        name: payload.name?.trim() || state.user.name,
        avatar: payload.avatar?.trim() || state.user.avatar,
        image: payload.avatar?.trim() || state.user.image,
      }
      : {
        userId: cognitoUser.getUsername(),
        email: cognitoUser.getUsername(),
        name: payload.name?.trim(),
        avatar: payload.avatar?.trim(),
        image: payload.avatar?.trim(),
      };

    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        isInitialized: true,
        user: nextUser,
      },
    });
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      throw new Error('No active user session');
    }

    await new Promise<void>((resolve, reject) => {
      cognitoUser.getSession((err: any, session: CognitoUserSession) => {
        if (err || !session?.isValid()) {
          reject(err || new Error('Invalid session'));
          return;
        }

        cognitoUser.changePassword(oldPassword, newPassword, (changeErr) => {
          if (changeErr) {
            reject(changeErr);
            return;
          }
          resolve();
        });
      });
    });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <AWSCognitoContext
      value={{ ...state, login, logout, register, forgotPassword, resetPassword, updateProfile, changePassword, codeVerification, resendConfirmationCode }}
    >
      {children}
    </AWSCognitoContext>
  );
};

export default AWSCognitoContext;
