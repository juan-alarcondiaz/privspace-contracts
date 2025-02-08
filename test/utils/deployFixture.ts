import { ethers } from "hardhat";
import {PrivateInfoStorage, PrivateInfoStorage__factory} from "../../typechain-types";
import {HDNodeWallet} from "ethers";

export async function deployFixture() {
    const kiiPrivateInfo: string = "Private phrase";
    const addresses: HDNodeWallet[] = Array.from({ length: 8 }, () => ethers.Wallet.createRandom());

    const privateInfoStorageFactory: PrivateInfoStorage__factory = await ethers.getContractFactory("PrivateInfoStorage");
    const privateInfoStorage: PrivateInfoStorage = await privateInfoStorageFactory.deploy(kiiPrivateInfo, addresses) as PrivateInfoStorage;
    const nonAuthorizedSigner: HDNodeWallet = ethers.Wallet.createRandom().connect(ethers.provider);

    return { privateInfoStorage, kiiPrivateInfo, addresses, nonAuthorizedSigner };
}