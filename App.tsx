/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '654999969830-2mgqggf9i84g9ujd34eqloum771nq0oa.apps.googleusercontent.com', // Get this from Firebase Console
  offlineAccess: true, // If you need a refresh token
});

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onLogout = async () => {
    try {
      // Sign out from Firebase
      await auth().signOut();

      // Revoke Google Sign-In session
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      console.log(JSON.stringify(signInResult, null, 2));
      // Try the new style of google-sign in result, from v13+ of that module
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // if you are using older versions of google-signin, try old style result
        idToken = (signInResult as any).idToken;
      }
      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle user state changes
  const onAuthStateChanged = React.useCallback((userData: typeof user) => {
    console.log('onAuthStateChanged', user);
    setUser(userData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [onAuthStateChanged]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          {user ? (
            <>
              <Image
                source={{uri: user.photoURL ?? ''}}
                style={styles.profileImg}
              />
              <Text>Welcome {user.displayName}</Text>
              <Text>{user.email}</Text>
              <Text>{user.providerId}</Text>
              <Text>{user.metadata.creationTime}</Text>
              <Text>{user.metadata.lastSignInTime}</Text>
              <WebView
                source={{
                  uri: 'https://expense-manager-balaspyrus-projects.vercel.app/dashboard',
                }}
                style={{
                  width: 500,
                  height: 1000,
                  backgroundColor: 'black',
                  overflow: 'scroll',
                }}
              />

              <Button title="Logout" onPress={onLogout} />
            </>
          ) : (
            <GoogleSigninButton onPress={onGoogleButtonPress} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  container: {
    backgroundColor: Colors.white,
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
