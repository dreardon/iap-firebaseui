import * as firebaseui from 'firebaseui';
import * as ciap from 'gcip-iap';

const configs = {
  '[API_KEY]': {
    authDomain: '[AUTH_DOMAIN]',
    displayMode: 'optionsFirst',
    tosUrl: 'https://sampletos.com',
    privacyPolicyUrl: 'https://cloud.google.com/terms/cloud-privacy-notice',
    callbacks: {
      beforeSignInSuccess: (user) => {
        return user.updateProfile({
          displayName: 'Custom Display Name',
        }).then(function() {
          return user.getIdToken(true);
        }).then(function() {
          return user;
        });
      }
    },
    tenants: {
      '*': {
        signInOptions: [
          {
            "provider": '[PROVIDER]',
            "providerName": '[PROVIDER_NAME]',
            "scopes": [
              '[SCOPES]'
            ]
          }
        ],
        immediateFederatedRedirect: false,
        signInFlow: 'redirect',
      }
    }
  }
}

const handler = new firebaseui.auth.FirebaseUiHandler(
  '#firebaseui-auth-container', configs);
const ciapInstance = new ciap.Authentication(handler);
ciapInstance.start();
