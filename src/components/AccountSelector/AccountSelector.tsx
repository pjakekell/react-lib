import React, { useState, useMemo } from 'react';
import Uik from '@reef-defi/ui-kit';
import { ReefSigner } from '../../state';
import { toReefBalanceDisplay, trim } from '../../utils';
import './AccountSelector.css';

export type Network = 'mainnet' | 'testnet';

interface AccountSelector {
  accounts: ReefSigner[];
  selectedSigner?: ReefSigner;
  selectAccount: (index: number, signer: ReefSigner) => void;
  selectedNetwork?: Network;
  onNetworkSelect?: (network: Network) => any;
  isBalanceHidden?: boolean;
  showBalance?: (...args: any[]) => any;
}

export const AccountSelector = ({
  selectedSigner,
  accounts,
  selectAccount,
  selectedNetwork,
  onNetworkSelect,
  isBalanceHidden,
  showBalance,
}: AccountSelector): JSX.Element => {
  const name = selectedSigner ? selectedSigner.name : '';
  const balance = toReefBalanceDisplay(selectedSigner?.balance);

  const [isOpen, setOpen] = useState(false);

  const getAccounts = useMemo(() => accounts.map((account) => ({
    name: account.name,
    address: account.address,
    evmAddress: account.evmAddress,
  })), [accounts]);

  const selectedAccount = useMemo(() => {
    if (!selectedSigner?.address) return null;

    return {
      name: selectedSigner.name,
      address: selectedSigner.address,
      evmAddress: selectedSigner.evmAddress,
    };
  }, [selectedSigner]);

  const select = (account): void => {
    const acc = accounts.find((acc: ReefSigner) => acc.address === account.address);
    if (!acc) return;

    const index = accounts.indexOf(acc);
    selectAccount(index, acc);
    setOpen(false);
  };

  return (
    <div className="nav-account border-rad">
      <div className="my-auto mx-2 fs-6">
        {
          isBalanceHidden ? (
            <button
              type="button"
              className="nav-account__hidden-balance"
              onClick={showBalance}
            >
              <div />
              <div />
              <div />
              <div />
              <div />
            </button>
          ) : (
            <span className="nav-account__balance">{ balance }</span>
          )
        }
      </div>
      <button
        type="button"
        className="nav-account__account"
        onClick={() => setOpen(true)}
      >
        <span>{trim(name)}</span>
      </button>

      <Uik.AccountSelector
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        accounts={getAccounts}
        selectedAccount={selectedAccount}
        onSelect={select}
        selectedNetwork={selectedNetwork}
        onNetworkSelect={onNetworkSelect}
      />
    </div>
  );
};
