/**
 * Africa-native grocery / mobile-money checkout helpers (F13).
 * Deep links and till instructions — not a payment processor.
 */

import type { MarketId } from "@/lib/localMarket";
import type { GroceryListItem } from "@/lib/groceryEngine";
import { exportGroceryListText } from "@/lib/groceryEngine";

export type VendorKind = "marketplace" | "delivery" | "mobile_money" | "whatsapp_market";

export type CommerceVendor = {
  id: string;
  name: string;
  kind: VendorKind;
  markets: MarketId[];
  description: string;
  /** Build an outbound URL for this list / market */
  buildUrl: (ctx: { query: string; marketId: MarketId; listText: string }) => string | null;
  checkoutHint: string;
};

function encode(q: string) {
  return encodeURIComponent(q.trim());
}

export const COMMERCE_VENDORS: CommerceVendor[] = [
  {
    id: "jumia",
    name: "Jumia",
    kind: "marketplace",
    markets: ["ng", "ke", "gh", "eg", "default"],
    description: "Supermarket aisle + delivery where Jumia operates",
    buildUrl: ({ query, marketId }) => {
      const hosts: Partial<Record<MarketId, string>> = {
        ng: "https://www.jumia.com.ng/catalog/?q=",
        ke: "https://www.jumia.co.ke/catalog/?q=",
        gh: "https://www.jumia.com.gh/catalog/?q=",
        eg: "https://www.jumia.com.eg/catalog/?q=",
        default: "https://www.jumia.com/catalog/?q=",
      };
      return `${hosts[marketId] || hosts.default}${encode(query)}`;
    },
    checkoutHint: "Pay with card, cash on delivery, or local wallets where offered.",
  },
  {
    id: "glovo",
    name: "Glovo",
    kind: "delivery",
    markets: ["ke", "gh", "ng", "default"],
    description: "Quick commerce / restaurant delivery in supported cities",
    buildUrl: ({ query }) => `https://glovoapp.com/search?q=${encode(query)}`,
    checkoutHint: "In-app wallet, card, or cash to rider depending on city.",
  },
  {
    id: "uber_eats",
    name: "Uber Eats / grocery",
    kind: "delivery",
    markets: ["za", "ke", "default"],
    description: "Grocery partners in larger metros",
    buildUrl: ({ query }) => `https://www.ubereats.com/search?q=${encode(query)}`,
    checkoutHint: "Card or Uber Cash; cash options vary by market.",
  },
  {
    id: "whatsapp_market",
    name: "WhatsApp market runner",
    kind: "whatsapp_market",
    markets: ["ng", "ke", "gh", "za", "eg", "tz", "default"],
    description: "Send this stall list to your usual market person",
    buildUrl: ({ listText }) => {
      const text = `Please buy these for me:\n\n${listText}`;
      return `https://wa.me/?text=${encode(text)}`;
    },
    checkoutHint: "Agree cash, transfer, or mobile money with your runner.",
  },
  {
    id: "mpesa",
    name: "M-Pesa pay guide",
    kind: "mobile_money",
    markets: ["ke", "tz", "default"],
    description: "Open Safaricom M-Pesa flow notes for Kenya / Tanzania households",
    buildUrl: ({ marketId }) => {
      if (marketId === "ke") return "https://www.safaricom.co.ke/personal/m-pesa";
      if (marketId === "tz") return "https://www.vodacom.co.tz/mpesa";
      return "https://www.safaricom.co.ke/personal/m-pesa";
    },
    checkoutHint:
      "Lipa na M-Pesa → Buy Goods or Paybill. Confirm till/paybill with the vendor before sending.",
  },
  {
    id: "mtn_momo",
    name: "MTN MoMo",
    kind: "mobile_money",
    markets: ["gh", "default"],
    description: "Mobile money checkout notes for Ghana and peers",
    buildUrl: () => "https://www.mtn.com.gh/momo/",
    checkoutHint: "Use MoMo merchant / till from your market seller or supermarket.",
  },
];

export function vendorsForMarket(marketId: MarketId): CommerceVendor[] {
  return COMMERCE_VENDORS.filter(
    (v) => v.markets.includes(marketId) || v.markets.includes("default")
  );
}

export function topUncheckedQuery(items: GroceryListItem[]): string {
  const first = items.find((i) => !i.checked);
  return first?.name || "groceries";
}

export function buildCheckoutBundle(
  items: GroceryListItem[],
  planName: string,
  marketId: MarketId
) {
  const listText = exportGroceryListText(items, `Shopping list — ${planName}`, {
    marketId,
    groupByStall: true,
  });
  const query = topUncheckedQuery(items);
  return vendorsForMarket(marketId).map((vendor) => ({
    vendor,
    url: vendor.buildUrl({ query, marketId, listText }),
  }));
}
