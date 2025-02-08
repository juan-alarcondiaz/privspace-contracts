import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {PrivateInfoStorage} from "../typechain-types";
import {ContractTransactionResponse, HDNodeWallet} from "ethers";
import {deployFixture} from "./utils/deployFixture";

describe("PrivateInfoStorage contract", function () {
    let privateInfoStorage: PrivateInfoStorage;
    let kiiPrivateInfo: string;
    let addresses: HDNodeWallet[];
    let nonAuthorizedSigner: HDNodeWallet;

    beforeEach(async function () {
        ({ privateInfoStorage, kiiPrivateInfo, addresses, nonAuthorizedSigner } = await loadFixture(deployFixture));
    });

    describe('Authorization', function () {
        it("Should indicate that the address is authorized", async function () {
            const role: bigint = await privateInfoStorage.authenticate();
            expect(role, "Expected the data type to be bigint").to.be.a("bigint");
            expect(role, "Expected the access level to be 0 (owner)").to.equal(0n);
        });

        it("Should indicate that the address is authorized", async function () {
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(addresses[1].connect(ethers.provider));
            const role: bigint = await privateInfoStorageConnected.authenticate();
            expect(role, "Expected the data type to be bigint").to.be.a("bigint");
            expect(role, "Expected the access level to be 1 (user)").to.equal(1n);
        });

        it("Should indicate that the address is not authorized", async function () {
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(nonAuthorizedSigner);
            await expect(privateInfoStorageConnected.authenticate(), "Expected the call to revert because the caller is not whitelisted").to.be.revertedWithCustomError(privateInfoStorageConnected, "AddressNotWhitelisted");
        })
    });

    describe("Whitelist management", function () {
        it("Should retrieve the initial whitelist correctly", async function () {
            const whitelist: string[] = await privateInfoStorage.getWhitelist();
            expect(whitelist, "Expected the initial whitelist to contain the specified values")
                .to.deep.equal(["0x5Ec605060d810669fd7134494C4AF17ab438CC92", ...addresses.map(address => address.address) ]);
        });

        it("Should add a new address to the whitelist", async function () {
            const newAddress: string = ethers.Wallet.createRandom().address;
            const addAddressTx: ContractTransactionResponse = await privateInfoStorage.addAddress(newAddress);
            const whitelist: string[] = await privateInfoStorage.getWhitelist();
            expect(addAddressTx, "Expected the (AddedAddress) event to be emitted with the correct arguments").to.emit(privateInfoStorage, "AddedAddress").withArgs(newAddress);
            expect(whitelist, "Expected the specified addresses to be added to the whitelist correctly")
                .to.include(newAddress);
        });

        it("Should revert when a non-authorized user attempts to add address to the whitelist", async function () {
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(nonAuthorizedSigner);
            const newAddress: string = ethers.Wallet.createRandom().address;
            await expect(privateInfoStorageConnected.addAddress(newAddress),"Expected the transaction to revert because only the owner can update the private information").to.be.revertedWithCustomError(privateInfoStorageConnected, "NotOwner");
        });

        it("Should revert when the whitelist capacity is reached", async function () {
            await privateInfoStorage.addAddress(ethers.Wallet.createRandom().address);
            await expect(privateInfoStorage.addAddress(ethers.Wallet.createRandom().address), "Expected the transaction to revert because the whitelist has reached its maximum capacity, and no more addresses can be added").to.be.revertedWithCustomError(privateInfoStorage, "WhitelistCapacityReached");
        });

        it("Should revert when adding a duplicate address to the whitelist", async function () {
            const duplicateAddress: string = addresses[0].address;
            await expect(privateInfoStorage.addAddress(duplicateAddress), "Expected the transaction to revert because duplicate addresses cannot be added to the whitelist").to.be.revertedWithCustomError(privateInfoStorage, "AddressAlreadyWhitelisted");
        });

        it("Should revert when a non-authorized user attempts to add to the whitelist", async function () {
            const newAddress: string = ethers.Wallet.createRandom().address;
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(nonAuthorizedSigner);
            await expect(privateInfoStorageConnected.addAddress(newAddress), "Expected the transaction to revert because only the owner can add addresses to the whitelist").to.be.revertedWithCustomError(privateInfoStorageConnected, "NotOwner");
        });

    })

    describe("Private info management", function () {
        it("Should retrieve the initial private information correctly", async function () {
            const kiiPrivateInfoStored: string = await privateInfoStorage.getKiiPrivateInfo();
            expect(kiiPrivateInfoStored, "Expected the initial private information to match the specified value")
                .to.equal(kiiPrivateInfo);
        });

        it("Should revert when a non-authorized user attempts to retrieve private information", async function () {
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(nonAuthorizedSigner);
            await expect(privateInfoStorageConnected.getKiiPrivateInfo(), "Expected the call to revert because the caller does not have permissions to access private information")
                .to.be.revertedWithCustomError(privateInfoStorageConnected, "AddressNotWhitelisted");
        });

        it("Should update private information", async function () {
            const newKiiPrivateInfo: string = "New private phrase";
            const setKiiPrivateInfoTx: ContractTransactionResponse = await privateInfoStorage.setKiiPrivateInfo(newKiiPrivateInfo);
            const kiiPrivateInfoStored: string = await privateInfoStorage.getKiiPrivateInfo();
            expect(setKiiPrivateInfoTx, "Expected the (KiiPrivateInfoUpdated) event to be emitted with the correct arguments").to.emit(privateInfoStorage, "KiiPrivateInfoUpdated").withArgs(newKiiPrivateInfo);
            expect(kiiPrivateInfoStored, "Expected the private information to be updated correctly")
                .to.equal(newKiiPrivateInfo);
        });

        it("Should revert when a non-authorized user attempts to update private information", async function () {
            const privateInfoStorageConnected: PrivateInfoStorage = privateInfoStorage.connect(nonAuthorizedSigner);
            const newKiiPrivateInfo: string = "Unauthorized update";
            await expect(privateInfoStorageConnected.setKiiPrivateInfo(newKiiPrivateInfo),"Expected the transaction to revert because only the owner can update the private information").to.be.revertedWithCustomError(privateInfoStorageConnected, "NotOwner");
        });

    })
});