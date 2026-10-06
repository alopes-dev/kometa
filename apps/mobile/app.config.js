module.exports = {
  expo: {
    name: "Kometa",
    slug: "kometa",
    owner: "anthony.lopez",
    version: "1.0.0",
    icon: "./assets/icon.png",
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: "kometa",
    ios: {
      supportsTablet: false,
      bundleIdentifier: "so.sof.kometa",
    },
    android: {
      package: "so.sof.kometa",
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
        // The source logo is the bare mark, so the plate it sits on is a
        // colour rather than an image: the launcher's mask then crops clean
        // brand green at any shape.
        backgroundColor: "#0FA854",
      },
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/splash-icon.png",
          // The image is the white mark on transparency and the background is
          // the icon's own green, so the launcher icon appears to open into
          // the splash rather than cutting to a different screen.
          backgroundColor: "#0FA854",
          // The canvas is padded for the circular mask Android 12+ applies, so
          // this is wider than the mark: it renders at roughly half of it.
          imageWidth: 288,
          resizeMode: "contain",
        },
      ],
      "expo-image",
      "expo-dev-client",
      [
        "expo-location",
        {
          // Shown in the iOS system dialog that the pre-permission screen
          // (node 44:22414) leads into, so the sentence the user reads on that
          // screen and the sentence iOS shows say the same thing.
          locationWhenInUsePermission:
            "A Kometa usa a tua localização para mostrar restaurantes e lojas que entregam perto de ti.",
        },
      ],
      "expo-notifications",
      [
        "@rnmapbox/maps",
        {
          // Build-time token used only to download the native Mapbox SDK from
          // their private registry — not the same as the runtime public token.
          // See .env.example for where this comes from.
          RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "638c24e1-00a3-4df2-8465-37d85d4ef4c5",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/638c24e1-00a3-4df2-8465-37d85d4ef4c5",
    },
  },
};
