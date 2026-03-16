import React, { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { showToast } from '@/utils/toast';

const GITHUB_RELEASE_API = 'https://api.github.com/repos/huamurui/zhihu-minus-minus/releases/latest';
const IGNORED_VERSION_KEY = 'ignored_version_tag';

export const useCheckUpdate = () => {
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const response = await fetch(GITHUB_RELEASE_API);
        const data = await response.json();

        if (data && data.tag_name) {
          const latestVersionTag = data.tag_name;
          const latestVersion = latestVersionTag.replace('v', '');
          const currentVersion = Constants.expoConfig?.version || '0.0.0';

          // 检查是否已经忽略了此版本
          const ignoredVersion = await SecureStore.getItemAsync(IGNORED_VERSION_KEY);
          if (ignoredVersion === latestVersionTag) {
            return;
          }

          if (isVersionNewer(latestVersion, currentVersion)) {
            // 查找 APK 文件
            const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));

            const buttons: any[] = [
              { text: '稍后', style: 'cancel' },
              {
                text: '忽略此版本',
                style: 'destructive',
                onPress: async () => {
                  await SecureStore.setItemAsync(IGNORED_VERSION_KEY, latestVersionTag);
                },
              }
            ];

            if (Platform.OS === 'android' && apkAsset) {
              buttons.push({
                text: '直接更新',
                onPress: () => downloadAndInstallApk(apkAsset.browser_download_url, latestVersionTag),
              });
            }

            buttons.push({
              text: '去下载 (GitHub)',
              onPress: () => {
                const downloadUrl = data.html_url;
                if (Platform.OS === 'android') {
                  WebBrowser.openBrowserAsync(downloadUrl);
                } else {
                  Linking.openURL(downloadUrl);
                }
              },
            });

            Alert.alert(
              '发现新版本',
              `最新版本 ${latestVersionTag} 已发布。\n\n更新内容：\n${data.body || '无更新说明'}`,
              buttons
            );
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    checkUpdate();
  }, []);
};

/**
 * Android APK Download & Install
 */
async function downloadAndInstallApk(url: string, version: string) {
  try {
    const filename = `zhihu--_${version}.apk`;
    const documentDirectory = FileSystem.documentDirectory;
    if (!documentDirectory) throw new Error('Document directory not found');
    const fileUri = `${documentDirectory}${filename}`;

    showToast('开始下载更新...');

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (progress === 1) {
            showToast('下载完成，准备安装');
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (result && result.uri) {
      if (Platform.OS === 'android') {
        const cUri = await FileSystem.getContentUriAsync(result.uri);
        IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
          data: cUri,
          flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/vnd.android.package-archive',
        });
      } else {
        // iOS or others: share file
        await Sharing.shareAsync(result.uri);
      }
    }
  } catch (e) {
    console.error('Download/Install error:', e);
    showToast('更新失败，请尝试手动下载');
  }
}

/**
 * Simple version comparison
 * @param latest "0.0.6"
 * @param current "0.0.5"
 * @returns true if latest > current
 */
function isVersionNewer(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}

export const UpdateChecker: React.FC = () => {
  useCheckUpdate();
  return null;
};
