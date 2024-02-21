import { useState } from 'react';
import { extension as extReef } from '@reef-chain/util-lib';
import { useAsyncEffect } from './useAsyncEffect';

function getBrowserExtensionUrl(): string | undefined {
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  if (isFirefox) {
    return 'https://addons.mozilla.org/en-US/firefox/addon/reef-js-extension/';
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if (isChrome) {
    return 'https://chrome.google.com/webstore/detail/reefjs-extension/mjgkpalnahacmhkikiommfiomhjipgjn';
  }
  return undefined;
}

// TODO: Show options to install snap and easy wallet when they are available
function getInstallExtensionMessage(): { message: string; url?: string } {
  const extensionUrl = getBrowserExtensionUrl();
  const installText = extensionUrl
    ? 'Please install Reef chain or some other Solidity browser extension and refresh the page.'
    : 'Please use Chrome or Firefox browser.';
  return {
    message: `App uses browser extension to get accounts and securely sign transactions. ${installText}`,
    url: extensionUrl,
  };
}

export const useInjectExtension = (
  appDisplayName: string,
): [
  extReef.InjectedAccountWithMeta[],
    extReef.InjectedExtension|undefined,
  boolean,
  { code?: number; message: string; url?: string } | undefined
] => {
  const [accountsVal, setAccountsVal] = useState<extReef.InjectedAccountWithMeta[]>([]);
  const [extensionVal, setExtensionVal] = useState<extReef.InjectedExtension>();
  const [isReefInjected, setIsReefInjected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: number; url?: string }>();
  let extensions: extReef.InjectedExtension[];

  document.addEventListener('reef-injected', async () => {
    if (!isReefInjected)setIsReefInjected(true);
  });
  useAsyncEffect(async () => {
    try {
      setError(undefined);
      setIsLoading(true);
      extensions = await extReef.web3Enable(appDisplayName);
      const reefExt = extensions.length > 0 ? extensions[0] : undefined;
      if (!reefExt || (reefExt.name !== extReef.REEF_EXTENSION_IDENT 
          && reefExt.name !== extReef.REEF_SNAP_IDENT)) {
        const installExtensionMessage = getInstallExtensionMessage();
        setError({
          code: 1,
          ...installExtensionMessage,
        });
        setIsLoading(false);
        return;
      }

      setExtensionVal(reefExt);

      // const web3accounts = await web3Accounts();
      const reefAccounts = await reefExt.accounts.get();
      if (reefAccounts.length < 1) {
        setError({
          code: 2,
          message:
            'App requires at least one account in browser extension. Please create or import account/s and refresh the page.',
        });
        setIsLoading(false);
        return;
      }

      // const accounts = await Promise.all(extensions.map((ext) => ext.accounts.get()));
      const accountsWithMeta = reefAccounts.map((acc) => ({
        address: acc.address,
        meta: {
          genesisHash: acc.genesisHash,
          name: acc.name,
          source: reefExt.name,
        },
        type: acc.type,
      } as extReef.InjectedAccountWithMeta));
      setAccountsVal(accountsWithMeta);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error when loading signers!', e);
      setError(e as { message: string });
    } finally {
      setIsLoading(false);
    }
  }, [isReefInjected]);

  return [accountsVal, extensionVal, isLoading, error];
};
