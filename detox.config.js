module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/recomate.app',
      build: 'xcodebuild -workspace ios/recomate.xcworkspace -scheme recomate -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_9_Pro_XL' // put your emulator
      }
    }
  },
  configurations: {
    'ios.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
