import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core";

export default buildModule("PrivateInfoStorageModule", (m) => {
    const kiiPrivateInfo: string = "Private phrase";
    const wallets: string[] = ["0xcaF3415F37B557554B56283845b4E9924620e809"];
    const privateInfoStorage: NamedArtifactContractDeploymentFuture<"PrivateInfoStorage"> = m.contract("PrivateInfoStorage", [kiiPrivateInfo, wallets]);
    return { privateInfoStorage };
});