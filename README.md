# Fibarium Protocol

Fibarium protocol is a web3 identity management protocol on the blockchain network

This protocol is used to securely store personal data and make it available to third-party web3 projects.

## Install

### Install dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

---

## Testing

### Run all tests:

```bash
npx hardhat test
```

### Run Profile tests:

```shell
npx hardhat test test/Profile.js
```

## Deployment

### Deployment smart contracts on-chain:

```bash
npx hardhat run --network <network> ./scripts/deploy.js 
```

## Utilities

### Receiving hardhat size-contracts:

```shell
npx hardhat size-contracts --no-compile
```

## Update

### Updating dependencies of the project:

```shell
sudo npm install -g npm-check-updates     
ncu --upgrade
npm install
```

## Sapphire deployment

To start storage in the sapphire network, run the following commands:

### Deploy smart-contract in enclave network (sapphire)

```shell
npx hardhat deploy-sapphire-storage --network sapphire-testnet --host-network bsc-testnet     
```

### Deploy smart-contract in host network

```shell
npx hardhat deploy-profile-sapphire-storage --network bsc-testnet --sapphire-storage-address 0xADDR1 --profile-address=0xADDR2
```