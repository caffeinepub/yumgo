import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import List "mo:core/List";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  public type CatalogItem = { id : Text; name : Text; price : Nat; imageUrl : Storage.ExternalBlob };
  public type User = { id : Principal; name : Text; collegeDomain : Text };
  public type Shop = { id : Text; name : Text; ownerId : Principal; collegeDomain : Text };
  public type Order = {
    id : Text;
    shopId : Text;
    userId : Principal;
    itemList : [Text];
    status : { #placed; #completed };
  };

  public type Bill = {
    id : Text;
    orderId : Text;
    shopId : Text;
    userId : Principal;
    total : Nat;
    paymentStatus : { #pending; #paid };
    upiQrUrl : Storage.ExternalBlob;
  };

  var nextBillCounter = 1;

  // Internal state
  let users = Map.empty<Principal, User>();
  let shops = Map.empty<Text, Shop>();
  let catalog = Map.empty<Text, CatalogItem>();
  let orders = Map.empty<Text, Order>();
  let bills = Map.empty<Text, Bill>();
  var shopImages = Map.empty<Principal, Storage.ExternalBlob>();
  var upiQrCodes = Map.empty<Principal, Storage.ExternalBlob>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Shop {
    public func compare(shop1 : Shop, shop2 : Shop) : Order.Order {
      switch (Text.compare(shop1.collegeDomain, shop2.collegeDomain)) {
        case (#equal) { Text.compare(shop1.name, shop2.name) };
        case (order) { order };
      };
    };
  };

  // Function to generate the next bill number
  func generateBillNumber() : Text {
    var numberText = nextBillCounter.toText();
    while (numberText.size() < 6) {
      numberText := "0" # numberText;
    };
    let billNumber = "CCO-" # numberText;
    nextBillCounter += 1;
    billNumber;
  };

  public query ({ caller }) func getAvailableShopsByCollege(collegeDomain : Text) : async [Shop] {
    shops.values().toArray().filter(func(shop) { shop.collegeDomain == collegeDomain }).sort();
  };

  public shared ({ caller }) func createBill(orderId : Text, shopId : Text, userId : Principal, total : Nat, upiQrUrl : Storage.ExternalBlob) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create bills");
    };

    let billNumber = generateBillNumber();
    let newBill : Bill = {
      id = billNumber;
      orderId;
      shopId;
      userId;
      total;
      paymentStatus = #pending;
      upiQrUrl;
    };

    bills.add(billNumber, newBill);
    newBill;
  };

  public query ({ caller }) func getShopsByCollege(collegeDomain : Text) : async [Shop] {
    shops.values().toArray().filter(func(shop) { shop.collegeDomain == collegeDomain });
  };

  // Function to add shop images
  public shared ({ caller }) func addShopImage(shopId : Text, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add images");
    };
    shopImages.add(caller, image);
  };

  // Function to add UPI QR codes
  public shared ({ caller }) func addUPIQRCode(shopId : Text, qrCode : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add UPI codes");
    };
    upiQrCodes.add(caller, qrCode);
  };
};
