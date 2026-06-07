# Quick Start

Get the app running on your phone in a few minutes.

## Prerequisites

**On your computer:**

- [Node.js](https://nodejs.org) 18 or higher (check with `node --version`)
- [Git](https://git-scm.com)

**On your phone:**

- The **Expo Go** app from the [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android) or [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

That's it — no Android Studio, no Xcode, no SDKs.

## Setup

```bash
git clone <repo-url>
cd christopher-alarm-app
npm install
```

## Run

```bash
npx expo start
```

A QR code will appear in your terminal. On your phone:

1. Open **Expo Go**
2. Tap **Scan QR code**
3. Point at the QR code in your terminal

The app will download and launch on your phone. Edit `App.tsx` and save — changes hot-reload automatically.

## Troubleshooting

- **Phone and computer must be on the same Wi-Fi network.** Most issues are this.
- **Connection times out / Wi-Fi is locked down:** run `npx expo start --tunnel` instead. Slower but works across networks.
- **`npm install` fails:** delete `node_modules` and `package-lock.json`, then run `npm install` again.
- **Nothing happens after scanning:** make sure no firewall is blocking the Expo dev server (default port 8081).

### Xiaomi (MIUI) setup

MIUI aggressively kills background apps. After installing, in **Settings → Apps → christopher-alarm-app**:

- **Autostart** → enable
- **Battery saver** → No restrictions
- **Other permissions** → enable "Start in background" and "Show on Lock screen"
- Untick **"Pause app activity if unused"**

Re-apply after every reinstall — MIUI resets these.

## Note

This guide will go out of date once we add native modules (e.g. Notifee for alarm notifications). At that point, Expo Go stops working and we'll need a custom dev build — instructions will follow when we get there.

## Wireless ADB setup

One-time per phone — initial pairing requires USB:

```bash
adb tcpip 5555                # restart adb on phone, listening on TCP
adb shell ip route            # find phone IP (or check Settings → About → Status)
adb connect 192.168.x.x:5555  # connect over network
adb devices                   # verify; should show the IP as 'device'
```

Re-pair after phone reboot (phone drops back to USB-only mode).
