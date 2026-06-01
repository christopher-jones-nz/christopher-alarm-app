import { registerRootComponent } from "expo";

import App from "./App";
import { handleBackgroundEvent } from "./src/notifications/handlers";
import notifee from "@notifee/react-native";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
notifee.onBackgroundEvent(handleBackgroundEvent);
registerRootComponent(App);
