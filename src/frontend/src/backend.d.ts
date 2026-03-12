import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Bill {
    id: string;
    total: bigint;
    paymentStatus: Variant_pending_paid;
    shopId: string;
    upiQrUrl: ExternalBlob;
    userId: Principal;
    orderId: string;
}
export interface Shop {
    id: string;
    ownerId: Principal;
    name: string;
    collegeDomain: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_paid {
    pending = "pending",
    paid = "paid"
}
export interface backendInterface {
    addShopImage(shopId: string, image: ExternalBlob): Promise<void>;
    addUPIQRCode(shopId: string, qrCode: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBill(orderId: string, shopId: string, userId: Principal, total: bigint, upiQrUrl: ExternalBlob): Promise<Bill>;
    getAvailableShopsByCollege(collegeDomain: string): Promise<Array<Shop>>;
    getCallerUserRole(): Promise<UserRole>;
    getShopsByCollege(collegeDomain: string): Promise<Array<Shop>>;
    isCallerAdmin(): Promise<boolean>;
}
